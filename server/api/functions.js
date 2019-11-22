const express = require('express');
const serialPort = require("serialport");
const cranedb = require('mysql');
// const Crane = require("../models/crane");
// const mongodb = require('mongodb');

//Configuracao do banco
var dbConn = cranedb.createConnection({
  host: 'localhost',
  user: 'root',
  password: '140497',
  database: 'crane'
});
// connect to database
dbConn.connect();


// Inicio da aplicacao
const router = express.Router();
let serial;
serial = new serialPort("/dev/ttyUSB0" , { baudRate : 9600 });
serial.on('open', function(){
  console.log('Serial Port Opend');
  serial.on('data', function(data){
    console.log("ta funcionando: , ",data);
  });
});

//GET
//return informations from height and angle to interface
router.get('/',(req,res) => {
  res.send('hellows');
});

router.post('/guindaste/status', (req, res) => {
  dbConn.query('INSERT INTO crane(altura) VALUES(10)');
  dbConn.query('INSERT INTO crane(altura) VALUES(10)');
});

//POST
//return angle,heigth,eletroimaStatus and nameOperator
router.post('/guindaste/atributos',(req,res) => {
  let registroBit = req.body.registro;
  let alturaBit = registroBit.altura; //+32
  let anguloBit = registroBit.angulo + 180; //+180
  let eletroimaStatusBit = registroBit.eletroimaStatus;

  // Valores do banco
  let anguloBd = getAngulo();
  let alturaBd = getAltura();
  let eletroimaBd = getEletroima();

  //Calculo do angulo
  let distAngulo = anguloBit - anguloBd;

  if(distAngulo < -180 || distAngulo > 180) {
    if(distAngulo > 180) {
      distAngulo = distAngulo - 360;
    } else {
      distAngulo  = distAngulo + 360;
    }
  }
  //Calculo da altura
  let distAltura = alturaBit - alturaBd;
  distAltura = distAltura + 32;

  //Conversão para Bit
  alturaBit = createBinaryStringWith6bits(distAltura);
  anguloBit = createBinaryStringWith9bits(distAngulo);
  eletroimaStatusBit = createBinaryStringWith1bits(eletroimaStatusBit);

  let result = eletroimaStatusBit + alturaBit + anguloBit;
  console.log(alturaBit);

  // Envia os dados para o Arduino
  serial.write(result);

  // Enviar para o MongoDB


  res.send({guindaste});
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
function createBinaryStringWith1bits(nMask) {
  let result;
  for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1) {
  }
  result = sMask.substring(31, 32);
  return result;
}
module.exports = router;
