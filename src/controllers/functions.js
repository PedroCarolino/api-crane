const express = require('express');
const serialPort = require("serialport");
const mysql = require('mysql');
const Readline = require('@serialport/parser-readline');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Create connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'pedro',
  password: '140497',
  database: 'crane'
});
// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySql Connected...');
});

// Inicio da aplicacao
const router = express.Router();
let serial;
serial = new serialPort("/dev/ttyUSB0", {baudRate: 9600});
serial.on('open', function () {
  console.log('Serial Port Open');
  serial.on('data', function (data) {
    console.log("ta funcionando: , ", data);
  });
});

//GET
router.get('/', (req, res) => {
  res.send('hello');
});

// POST ANTIGO
router.post('/guindaste/atributos', (req, res) => {
  let registroBit = req.body.registro;
  let nome = registroBit.nomeOperador;
  let alturaBit = registroBit.altura;
  let anguloBit = registroBit.angulo;
  let eletroimaStatusBit = registroBit.eletroimaStatus;

  // Pegar Valores do banco
  let sql = `SELECT angulo,altura FROM crane ORDER BY id DESC LIMIT 1`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);

    let registroBd = JSON.parse(JSON.stringify(results[0]));
    console.log(registroBd);

    let anguloBd = registroBd.angulo;
    let alturaBd = registroBd.altura;

    console.log(anguloBd);
    console.log(alturaBd);
    // Verificar se e Positivo ou Negativo
    let sinalAltura = 1;
    if (alturaBit < 0) {
      sinalAltura = 0;
    }
    let sinalAngulo = 1;
    if (anguloBit < 0) {
      sinalAngulo = 0;
    }
    //VERIFICAR O CALCULO
    // Calculo do angulo
    let distAngulo = anguloBit - anguloBd;
    console.log(distAngulo);
    // Calculo do altura
    let distAltura = alturaBit - alturaBd;

    //Conversão para Bit
    alturaBit = createBinaryStringWith5bits(distAltura);
    anguloBit = createBinaryStringWith8bits(distAngulo);
    eletroimaStatusBit = createBinaryStringWith1bits(eletroimaStatusBit);

    let result = sinalAngulo + anguloBit + sinalAltura + alturaBit + eletroimaStatusBit;
    console.log(result);

    // Envia os dados para o Arduino
    serial.write(result);

  });
  // Enviar para o Banco de Dados
  postStatus(nome, alturaBit, anguloBit, eletroimaStatusBit);
  res.send("deu bom doidao");
});

function postStatus(nome, altura, angulo, eletroima) {
  const sql = `INSERT INTO crane(nome,altura,angulo,eletroima) VALUES('${nome}','${altura}','${angulo}','${eletroima}')`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
  });
}

function getLastResult() {
  let sql = `SELECT angulo,altura FROM crane ORDER BY id DESC LIMIT 1`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    return results;
  });

}

function search(nameKey, myArray){
  for (var i=0; i < myArray.length; i++) {
    if (myArray[i].name === nameKey) {
      return myArray[i];
    }
  }
}

//GET Historico
router.get('/guindaste/status', (req, res) => {
  let sql = `SELECT altura,angulo,eletroima FROM crane limit 5`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    var rows = JSON.parse(JSON.stringify(results[0]));
    res.send(rows);
  });
});

router.post('/guindaste/createDatabase', (req, res) => {
  const sql = `CREATE DATABASE crane`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.send("Database criada");
  });
});

router.post('/guindaste/createTable', (req, res) => {
  const sql = `CREATE TABLE IF NOT EXISTS crane (id INT AUTO_INCREMENT PRIMARY KEY,nome VARCHAR(255) NOT NULL,altura int(11),angulo int(11),eletroima int(11))`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.send("Tabela criada");
  });
});

function createBinaryStringWith9bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(23, 32);
  return result;
}

function createBinaryStringWith6bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(26, 32);
  return result;
}

function createBinaryStringWith5bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(27, 32);
  return result;
}

function createBinaryStringWith8bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(24, 32);
  return result;
}

function createBinaryStringWith1bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(31, 32);
  return result;
}

module.exports = router;
