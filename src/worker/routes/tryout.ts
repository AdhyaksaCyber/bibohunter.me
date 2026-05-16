import { Hono as HonoTryout } from 'hono';
import { createSuccessResponse as createSuccessResponseTryout, createErrorResponse as createErrorResponseTryout } from '../../utils/security';

const tryoutRoutes = new HonoTryout();

// ---- LIST TRYOUT ----
tryoutRoutes.get('/list', async (c) => {
  try {
    // TODO: Query tryout list with pagination
    return c.json(
      createSuccessResponseTryout({
        tryouts: [],
        total: 0,
        page: 1,
        limit: 10,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Gagal mengambil data tryout', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET TRYOUT DETAIL ----
tryoutRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: Query tryout by ID
    // TODO: Get questions

    return c.json(
      createSuccessResponseTryout({
        id,
        title: 'Example Tryout',
        description: 'Tryout description',
        durationMinutes: 120,
        totalSoal: 100,
        passingScore: 70,
        soal: [],
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Tryout tidak ditemukan', 'NOT_FOUND'),
      { status: 404 }
    );
  }
});

// ---- START TRYOUT ----
tryoutRoutes.post('/:id/start', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: Create hasil_tryout record
    // TODO: Generate session token for this tryout

    return c.json(
      createSuccessResponseTryout({
        sessionId: 'session-123',
        tryoutId: id,
        startedAt: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Gagal memulai tryout', 'START_ERROR'),
      { status: 500 }
    );
  }
});

// ---- SUBMIT JAWABAN ----
tryoutRoutes.post('/:id/submit', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return c.json(
        createErrorResponseTryout('Jawaban diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Grade answers
    // TODO: Save jawaban_soal records
    // TODO: Calculate score
    // TODO: Update hasil_tryout

    return c.json(
      createSuccessResponseTryout({
        benar: 70,
        salah: 20,
        kosong: 10,
        skor: 85,
        persentase: 85,
        hasilStatus: 'lulus',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Gagal submit tryout', 'SUBMIT_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET HASIL TRYOUT ----
tryoutRoutes.get('/:id/hasil', async (c) => {
  try {
    const id = c.req.param('id');

    // TODO: Query hasil_tryout by id
    // TODO: Get jawaban_soal details

    return c.json(
      createSuccessResponseTryout({
        id,
        totalSoal: 100,
        terjawab: 90,
        benar: 70,
        salah: 20,
        kosong: 10,
        skor: 85,
        persentase: 85,
        hasilStatus: 'lulus',
        pembahasan: [],
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Hasil tidak ditemukan', 'NOT_FOUND'),
      { status: 404 }
    );
  }
});

// ---- CREATE TRYOUT (ADMIN) ----
tryoutRoutes.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, durationMinutes, totalSoal } = body;

    if (!title || !durationMinutes || !totalSoal) {
      return c.json(
        createErrorResponseTryout('Title, durationMinutes, totalSoal diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Create tryout in DB
    // TODO: Return created tryout with ID

    return c.json(
      createSuccessResponseTryout({
        id: 'tryout-123',
        title,
        description,
        durationMinutes,
        totalSoal,
      }),
      { status: 201 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Gagal membuat tryout', 'CREATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- UPLOAD SOAL (ADMIN, from Word using Mammoth) ----
tryoutRoutes.post('/:id/upload-soal', async (c) => {
  try {
    const id = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file) {
      return c.json(
        createErrorResponseTryout('File diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Parse Word file using Mammoth
    // TODO: Extract questions and answers
    // TODO: Save to soal table
    // TODO: Return success with number of soal imported

    return c.json(
      createSuccessResponseTryout({
        totalImported: 50,
        message: 'Soal berhasil diimport dari file Word',
      }),
      { status: 201 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseTryout('Gagal upload soal', 'UPLOAD_ERROR'),
      { status: 500 }
    );
  }
});

export default tryoutRoutes;
