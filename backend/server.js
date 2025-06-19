const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a Oracle
const dbConfig = {
  user: 'C##NANO',
  password: 'Nano123', // o la contraseña que usas para C##NANO
  connectString: 'localhost:1521/XE' // Changed IP to localhost
};

// Endpoint para registrar usuario y código de barras
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, codigo_barra, carrera, rol, contrasena } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `INSERT INTO usuarios (nombre, correo, codigo_barra, carrera, rol, contrasena)
       VALUES (:nombre, :correo, :codigo_barra, :carrera, :rol, :contrasena)`,
      { nombre, correo, codigo_barra, carrera, rol, contrasena },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Endpoint para buscar usuario por código de barras
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM usuarios WHERE correo = :correo AND contrasena = :contrasena`,
      { correo, contrasena }
    );
    if (result.rows.length > 0) {
      const columns = result.metaData.map(col => col.name.toLowerCase());
      const usuario = {};
      result.rows[0].forEach((val, idx) => {
        usuario[columns[idx]] = val;
      });
      res.json({ usuario });
    } else {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Endpoint para registrar un log de acceso (entrada/salida)
app.post('/api/accesslogs/record', async (req, res) => {
  const { user_code, event_type } = req.body;
  let connection;

  // Input Validation
  if (!user_code || !event_type) {
    return res.status(400).json({ error: 'User code and event type are required.' });
  }
  if (!['entry', 'exit'].includes(event_type)) {
    return res.status(400).json({ error: "Invalid event type. Must be 'entry' or 'exit'." });
  }

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Verify user_code exists in usuarios table
    const userResult = await connection.execute(
      `SELECT user_id FROM usuarios WHERE codigo_barra = :user_code`, // Assuming user_id is the PK
      { user_code }
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // const userId = userResult.rows[0][0]; // Get the actual user_id if needed for the access_logs table

    // 2. Insert into access_logs table
    // Assuming access_logs table has columns: LOG_ID (auto-generated or sequence), USER_CODE_FK, EVENT_TYPE, TIMESTAMP (default)
    // If USER_CODE_FK is not the primary key of usuarios, you might need to fetch the actual PK (e.g., USER_ID)
    await connection.execute(
      `INSERT INTO access_logs (user_code, event_type, event_timestamp)
       VALUES (:user_code, :event_type, SYSTIMESTAMP)`, // Using SYSTIMESTAMP for Oracle
      { user_code, event_type },
      { autoCommit: true } // autoCommit for single DML statement
    );

    res.status(201).json({ success: true, message: 'Access recorded successfully.' });

  } catch (err) {
    console.error('Error recording access log:', err);
    res.status(500).json({ error: 'Failed to record access log. ' + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
});

// Endpoint para buscar usuario por código de barras (codigo_barra)
app.get('/api/users/bycode/:user_code', async (req, res) => {
  const { user_code } = req.params;
  let connection;

  if (!user_code) {
    return res.status(400).json({ error: 'User code parameter is required.' });
  }

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT user_id, nombre, correo, carrera, rol, codigo_barra
       FROM usuarios
       WHERE codigo_barra = :user_code`, // Ensure 'codigo_barra' is the correct column name
      { user_code }
    );

    if (result.rows.length > 0) {
      const columns = result.metaData.map(col => col.name.toLowerCase());
      const usuario = {};
      result.rows[0].forEach((val, idx) => {
        usuario[columns[idx]] = val;
      });
      res.json({ usuario }); // Return the user object nested under 'usuario' key
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    console.error('Error fetching user by code:', err);
    res.status(500).json({ error: 'Failed to fetch user. ' + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
});


app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});