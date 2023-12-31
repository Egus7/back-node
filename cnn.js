const express = require('express');
const bodyParse = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = require('./port');
const app = express();

//prueba
const { clientMarket } = require('./database');
const config = require('./config');

app.set('llave', config.llave);
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());
app.use(cors());

//Hola mundo en el servidor de bienvenida 
app.get('/', (req, res) => {
    res.send(`Hola mundo es una API Rest de mmarketdemo`);
});

//autenticar mediante login
app.post('/minimarketdemoWeb/login', (req, res) => {
    const { codigo, clave } = req.body;

    // Realizar consulta a la base de datos para verificar las credenciales
    clientMarket.query(`SELECT * FROM seg_usuario WHERE codigo = '${codigo}' AND clave = '${clave}'`)
        .then(response => {
            if (response.rows.length > 0) {
                const usuario = response.rows[0];

                if (usuario.activo) {
                     // Las credenciales son válidas y el usuario está activo, generar el token JWT
                    const payload = {
                        codigo: usuario.codigo,
                        id_seg_usuario: usuario.id_seg_usuario
                    };
                    const token = jwt.sign(payload, app.get('llave'), { 
                        expiresIn: 1440 
                    });
                    res.json({ 
                        mensaje: 'Autenticación correcta.', 
                        token: token 
                    });
                } else {
                    res.status(401).json({ mensaje: 'El usuario no está activo.' });
                }
            } else {
                    res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
            }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ mensaje: 'Error en el servidor' });
        });
});

const rutasProtegidas = express.Router();

rutasProtegidas.use((req, res, next) => {
    const token = req.headers['access-token'];

    if (token) {
        jwt.verify(token, app.get('llave'), (err, decoded) => {
            if (err) {
                return res.json({ mensaje: 'Token incorrecto.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({ mensaje: 'Debe indicar un token.' });
    }
});

// obtener los datos de los usuarios
app.get('/minimarketdemoWeb/apirest/seguridades/usuarios', rutasProtegidas, (req, res) => {

    clientMarket.query('SELECT * FROM seg_usuario ORDER BY id_seg_usuario')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un usuario
app.get('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', rutasProtegidas,  (req, res) => {
    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_usuario WHERE id_seg_usuario = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// para insertar un usuario
app.post('/minimarketdemoWeb/apirest/seguridades/usuarios', rutasProtegidas, (req, res) => {
    const {codigo, apellidos, nombres, correo, clave, activo} = req.body;

    const query = `INSERT INTO seg_usuario (codigo, apellidos, nombres, correo, clave, activo) 
                    VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [codigo, apellidos, nombres, correo, clave, activo];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Usuario agregado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al agregar usuario" });
        });
});


// Verificar si el código, correo o clave de usuario ya existe en la base de datos
app.get('/minimarketdemoWeb/apirest/seguridades/usuarios/:campo/:valor', (req, res) => {
    const { campo, valor } = req.params;
    
    // Verificar existencia del campo en la consulta
    const camposValidos = ['codigo', 'correo', 'clave'];
    if (!camposValidos.includes(campo)) {
      res.status(400).json({ mensaje: 'Campo no válido' });
      return;
    }
    
    clientMarket.query(`SELECT EXISTS (SELECT 1 FROM seg_usuario WHERE ${campo} = '${valor}')`)
      .then(response => {
        const existe = response.rows[0].exists;
        res.json({ existe });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ mensaje: 'Error en el servidor' });
      });
  });
  
  
// para insertar un usuario para registro
app.post('/minimarketdemoWeb/apirest/seguridades/registro', (req, res) => {
    const {codigo, apellidos, nombres, correo, clave, activo} = req.body;

    const query = `INSERT INTO seg_usuario (codigo, apellidos, nombres, correo, clave, activo) 
                    VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [codigo, apellidos, nombres, correo, clave, activo];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Usuario agregado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al agregar usuario " });
        });
});


// para actualizar un usuario
app.put('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    const {codigo, apellidos, nombres, correo, clave, activo} = req.body;

    const query = `UPDATE seg_usuario SET codigo = $1, apellidos = $2, nombres = $3, correo = $4, clave = $5, 
                                        activo = $6 WHERE id_seg_usuario = '${id}'`;
    const values = [codigo, apellidos, nombres, correo, clave, activo];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Usuario actualizado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al actualizar el usuario" });
        });
});

// para eliminar un usuario
app.delete('/minimarketdemoWeb/apirest/seguridades/usuarios/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM seg_usuario WHERE id_seg_usuario = '${id}'`)
        .then(() => {
            res.status(201).json({ "message": "Usuario eliminado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al eliminar al usuario" });
        });
});

// obtener los datos de los seg_modulos
app.get('/minimarketdemoWeb/apirest/seguridades/modulos', rutasProtegidas, (req, res) => {

    clientMarket.query('SELECT * FROM seg_modulo ORDER BY id_seg_modulo')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un seg_modulo
app.get('/minimarketdemoWeb/apirest/seguridades/modulos/:id', rutasProtegidas, (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_modulo WHERE id_seg_modulo = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de los seg_perfil
app.get('/minimarketdemoWeb/apirest/seguridades/perfiles', rutasProtegidas, (req, res) => {

    
    clientMarket.query('SELECT * FROM seg_perfil ORDER BY id_seg_perfil')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un seg_perfil
app.get('/minimarketdemoWeb/apirest/seguridades/perfiles/:id', rutasProtegidas, (req, res) => {

    const { id } = req.params;

    
    clientMarket.query(`SELECT * FROM seg_perfil WHERE id_seg_perfil = ${id}`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

//obtener los datos de una asignacion
app.get('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', rutasProtegidas, (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM seg_asignacion WHERE id_seg_asignacion = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

//obtener los modulos que estan asignados a cada usuario mediante el idUsuario
app.get('/minimarketdemoWeb/apirest/seguridades/asignaciones/usuarios/:idUsuario', rutasProtegidas, (req, res) => {

    const idUsuario = req.params.idUsuario;

    clientMarket.query(`
        SELECT sm.*
        FROM seg_asignacion sa
        INNER JOIN seg_perfil sp ON sa.id_seg_perfil = sp.id_seg_perfil
        INNER JOIN seg_modulo sm ON sp.id_seg_modulo = sm.id_seg_modulo
        WHERE sa.id_seg_usuario = ${idUsuario}
    `)
    .then(response => {
        res.json(response.rows);
    })
    .catch(err => {
        console.log(err);
    });
});

//obtener los perfiles que estan asignados a cada usuario mediante el idUsuario
app.get('/minimarketdemoWeb/apirest/seguridades/asignaciones/perfiles/:idUsuario', rutasProtegidas, (req, res) => {

    const idUsuario = req.params.idUsuario;

    clientMarket.query(`
        SELECT * FROM seg_asignacion WHERE id_seg_usuario = ${idUsuario}
    `)
    .then(response => {
        res.json(response.rows);
    })
    .catch(err => {
        console.log(err);
    });
});


// para insertar una nueva asignacion
app.post('/minimarketdemoWeb/apirest/seguridades/asignaciones', rutasProtegidas, (req, res) => {
    
    const {id_seg_usuario, id_seg_perfil} = req.body;

    const query = `INSERT INTO seg_asignacion (id_seg_usuario, id_seg_perfil) 
                    VALUES ($1, $2)`;
    const values = [id_seg_usuario, id_seg_perfil];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Asignacion agregada correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al agregar la asignacion" });
        });
});

// para actualizar una nueva asignacion
app.put('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    const {id_seg_usuario, id_seg_perfil} = req.body;

    const query = `UPDATE seg_asignacion SET id_seg_usuario = $1, id_seg_perfil = $2 
                        WHERE id_seg_asignacion = '${id}'`;
    const values = [id_seg_usuario, id_seg_perfil];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Asignacion actualizada correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al actulizar la asignacion" });
        });
});

// para eliminar una asignacion
app.delete('/minimarketdemoWeb/apirest/seguridades/asignaciones/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM seg_asignacion WHERE id_seg_asignacion = '${id}'`)
        .then(() => {
            res.status(201).json({ "message": "Asignacion eliminada correctamente" });;
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al elimimar la asignacion" });
        });
});

// obtener los datos de los pry_proyectos
app.get('/minimarketdemoWeb/apirest/proyectos', rutasProtegidas, (req, res) => {

    clientMarket.query('SELECT * FROM pry_proyecto ORDER BY id_pry_proyecto')
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// obtener los datos de un pry_proyecto
app.get('/minimarketdemoWeb/apirest/proyectos/:id', rutasProtegidas, (req, res) => {

    const { id } = req.params;

    clientMarket.query(`SELECT * FROM pry_proyecto WHERE id_pry_proyecto = '${id}'`)
        .then(response => {
            res.json(response.rows);
        })
        .catch(err => {
            console.log(err);
        });
});

// para insertar una nuevo proyecto
app.post('/minimarketdemoWeb/apirest/proyectos', rutasProtegidas, (req, res) => {
    
    const {nombre, fecha_inicio, fecha_fin, estado, avance} = req.body;

    const query = `INSERT INTO pry_proyecto (nombre, fecha_inicio, fecha_fin, estado, avance) 
                    VALUES ($1, $2, $3, $4, $5)`;
    const values = [nombre, fecha_inicio, fecha_fin, estado, avance];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Proyecto agregado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al agregar proyecto" });
        });
});

// para actualizar una nuevo proyecto
app.put('/minimarketdemoWeb/apirest/proyectos/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    const {nombre, fecha_inicio, fecha_fin, estado, avance} = req.body;

    const query = `UPDATE pry_proyecto SET nombre =$1, fecha_inicio = $2, fecha_fin = $3, estado = $4, 
                        avance = $5  WHERE id_pry_proyecto = '${id}'`;
    const values = [nombre, fecha_inicio, fecha_fin, estado, avance];
    
    clientMarket.query(query, values)
        .then(() => {
            res.status(201).json({ "message": "Proyecto actualizado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al actualizar el proyecto" });
        });
});

// para eliminar un proyecto
app.delete('/minimarketdemoWeb/apirest/proyectos/:id', rutasProtegidas, (req, res) => {
    const { id } = req.params;
    
    clientMarket.query(`DELETE FROM pry_proyecto WHERE id_pry_proyecto = '${id}'`)
        .then(() => {
            res.status(201).json({ "message": "Proyecto eliminado correctamente" });
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ "message": "Error al eliminar el proyecto" });
        });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto: http://localhost:${port}`);
});
