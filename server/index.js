import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Validation Schemas
const incidentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    service: z.string().min(1, "Service is required"),
    severity: z.enum(['SEV1', 'SEV2', 'SEV3', 'SEV4']),
    status: z.enum(['OPEN', 'MITIGATED', 'RESOLVED']),
    owner: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
});

// Routes

// GET /api/incidents - List incidents with pagination, sort, filter
app.get('/api/incidents', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc',
            status,
            severity,
            service,
            search
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (severity) where.severity = severity;
        if (service) where.service = service;
        if (search) {
            where.OR = [
                { title: { contains: search } }, // SQLite specific: case-insensitive not default, usually okay
                { summary: { contains: search } }
            ];
        }

        const [incidents, total] = await prisma.$transaction([
            prisma.incident.findMany({
                skip,
                take,
                where,
                orderBy: {
                    [sort]: order
                }
            }),
            prisma.incident.count({ where })
        ]);

        res.json({
            data: incidents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / take)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/incidents - Create incident
app.post('/api/incidents', async (req, res) => {
    try {
        const validation = incidentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.format() });
        }

        const incident = await prisma.incident.create({
            data: validation.data
        });
        res.status(201).json(incident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/incidents/:id - Get single incident
app.get('/api/incidents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const incident = await prisma.incident.findUnique({
            where: { id }
        });
        if (!incident) return res.status(404).json({ error: 'Incident not found' });
        res.json(incident);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH /api/incidents/:id - Update incident
app.patch('/api/incidents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Allow partial updates, re-validate if necessary or use partial schema
        // For simplicity, just update what's passed if valid or blindly update (careful)
        // Better: validate partial
        const updateSchema = incidentSchema.partial();
        const validation = updateSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.format() });
        }

        const incident = await prisma.incident.update({
            where: { id },
            data: validation.data
        });
        res.json(incident);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Incident not found' });
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
