import { Hono } from 'hono';
import { createSuccessResponse, createErrorResponse } from '../../utils/security';

const materiRoutes = new Hono();

// ---- LIST MATERI ----
materiRoutes.get('/list', async (c) => {
  try {
    // TODO: Query materi from DB with pagination
    return c.json(
      createSuccessResponse({
        materi: [],
        total: 0,
        page: 1,
        limit: 10,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponse('Gagal mengambil data materi', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET MATERI DETAIL ----
materiRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: Query materi by ID
    // TODO: Update views count

    return c.json(
      createSuccessResponse({
        id,
        title: 'Example Material',
        description: 'Material description',
        category: 'Bahasa Indonesia',
        fileUrl: '/api/materi/download/file-key',
        createdAt: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponse('Materi tidak ditemukan', 'NOT_FOUND'),
      { status: 404 }
    );
  }
});

// ---- DOWNLOAD MATERI ----
materiRoutes.get('/download/:fileKey', async (c) => {
  try {
    const fileKey = c.req.param('fileKey');

    // TODO: Get file from storage (R2 or local)
    // TODO: Return file with proper headers

    return c.text('File content', {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': ttachment; filename="materi.pdf",
      },
    });
  } catch (error) {
    return c.json(
      createErrorResponse('File tidak ditemukan', 'NOT_FOUND'),
      { status: 404 }
    );
  }
});

// ---- UPLOAD MATERI (ADMIN) ----
materiRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const categoryId = formData.get('categoryId');

    if (!file || !title || !categoryId) {
      return c.json(
        createErrorResponse('File, title, dan categoryId diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Validate file type, size
    // TODO: Upload to storage (R2 or local)
    // TODO: Save metadata to DB
    // TODO: Return success with fileKey

    return c.json(
      createSuccessResponse({
        fileKey: 'materi/abc123.pdf',
        fileUrl: '/api/materi/download/materi/abc123.pdf',
      }),
      { status: 201 }
    );
  } catch (error) {
    return c.json(
      createErrorResponse('Gagal upload materi', 'UPLOAD_ERROR'),
      { status: 500 }
    );
  }
});

export default materiRoutes;
