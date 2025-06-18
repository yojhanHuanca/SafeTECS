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

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});