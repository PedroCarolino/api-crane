const express = require('express');
const serialPort = require("serialport");
const cranedb = require('mysql');
const Readline = require('@serialport/parser-readline');

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
  console.log('Serial Port Open');
  serial.on('data', function(data){
    console.log("ta funcionando: , ",data);
  });
});
const parser = serial.pipe(new Readline({ delimiter: '\n' }));
// Read the port data
parser.on('data', data =>{
  console.log('got word from arduino:', data);
});

//GET
router.get('/',(req,res) => {
  res.send('hello');
});

//GET Status
router.get('/guindaste/statusLayout', (req, res) => {
  const parser = serial.pipe(new Readline({ delimiter: '\n' }));
// Read the port data
  parser.on('data', data =>{
    console.log('got word from arduino:', data);
  });

  //Tem que ver oq essa data retorna e fazer o set dela nos campos do objeto array, para mandar para o app
  let array = {
    altura: data.altura,
    angulo: data.angulo,
    eletroima: data.eletroima
  };
  res.send({array});
});

//GET Historico
router.get('/guindaste/status', (req, res) => {
  dbConn.query('SELECT altura,angulo,eletroima FROM crane limit 5');
});

//POST ANTIGO
// router.post('/guindaste/atributos',(req,res) => {
//   let registroBit = req.body.registro;
//   let alturaBit = registroBit.altura; //+32
//   let anguloBit = registroBit.angulo + 180; //+180
//   let eletroimaStatusBit = registroBit.eletroimaStatus;
//
//   // Pegar Valores do banco
//   let registroBd = getLastResult();
//   console.log(registroBd);
//   let anguloBd = registroBd.angulo;
//   let alturaBd = registroBd.altura;
//
//   // Calculo do angulo
//   let distAngulo = anguloBit - anguloBd;
//
//   if(distAngulo < -180 || distAngulo > 180) {
//     if(distAngulo > 180) {
//       distAngulo = distAngulo - 360;
//     } else {
//       distAngulo  = distAngulo + 360;
//     }
//   }
//   //Calculo da altura
//   let distAltura = alturaBit - alturaBd;
//   distAltura = distAltura + 32;
//
//   // Enviar para o Banco de Dados
//   postStatus(alturaBit,anguloBit,eletroimaStatusBit);
//
//   //Conversão para Bit
//   alturaBit = createBinaryStringWith6bits(distAltura);
//   anguloBit = createBinaryStringWith9bits(distAngulo);
//   eletroimaStatusBit = createBinaryStringWith1bits(eletroimaStatusBit);
//
//   let result = anguloBit + alturaBit + eletroimaStatusBit;
//   console.log(alturaBit);
//
//   // Envia os dados para o Arduino
//   serial.write(result);
//
//   res.send({registroBd});
// });

//POST
router.post('/guidaste/atributos',(req,res) => {
  let registroBit = req.body.registro;
  let alturaBit = registroBit.altura;
  let anguloBit = registroBit.angulo;
  let eletroimaStatusBit = registroBit.eletroimaStatus;

  // Pegar Valores do banco
  let registroBd = getLastResult();
  let anguloBd = registroBd.angulo;
  let alturaBd = registroBd.altura;

  // Enviar para o Banco de Dados
  postStatus(alturaBit,anguloBit,eletroimaStatusBit);

  //Verificar se e Positivo ou Negativo
  let sinalAltura = 1;
  if(alturaBit < 0) {
    sinalAltura = 0;
  }
  let sinalAngulo = 1;
  if(anguloBit < 0) {
    sinalAngulo = 0;
  }
  // Calculo do angulo
  let distAngulo = anguloBit - anguloBd;
  // Calculo do altura
  let distAltura = alturaBit - alturaBd;

  //Conversão para Bit
  alturaBit = createBinaryStringWith5bits(distAltura);
  anguloBit = createBinaryStringWith8bits(distAngulo);
  eletroimaStatusBit = createBinaryStringWith1bits(eletroimaStatusBit);

  let result = sinalAngulo + anguloBit + sinalAltura + alturaBit + eletroimaStatusBit;
  console.log(alturaBit);

  // Envia os dados para o Arduino
  serial.write(result);

  res.send({registroBd});
});

function postStatus(nome,angulo, altura, eletroima) {
  // VALUES or SET ??
  dbConn.query('INSERT INTO crane(nome,altura,angulo,eletroima) VALUES (?,?,?,?)', {nome:nome, altura:altura, angulo:angulo, eletroima:eletroima});
}

function getLastResult() {
  console.log("vovozinha");
  dbConn.query('SELECT angulo,altura FROM crane ORDER BY id DESC LIMIT 1');
}

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
