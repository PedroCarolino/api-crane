const express = require('express');
const serialPort = require("serialport");

const router = express.Router();
let serial;
serial = new serialPort("/dev/ttyUSB0" , { baudRate : 9600 });
serial.on('open', function(){
  console.log('Serial Port Opend');
  serial.on('data', function(data){
    console.log("ta funcionando: 0000000010110100 , ",data);
  });
});

//GET
//return informations from height and angle to interface
router.get('/',(req,res) => {
  res.send('hellows');
});

//POST
//return angle,heigth,eletroimaStatus and nameOperator
router.post('/guindaste/atributos',(req,res) => {
  let registroBit = req.body.registro;
  let alturaBit = registroBit.altura;
  let anguloBit = registroBit.angulo;
  let eletroimaStatusBit = registroBit.eletroimaStatus;
  let nomeOperador = registroBit.nomeOperador;

  alturaBit = createBinaryStringWith6bits(alturaBit);
  anguloBit = createBinaryStringWith9bits(anguloBit);
  eletroimaStatusBit = createBinaryStringWith1bits(eletroimaStatusBit);

  let result = eletroimaStatusBit + alturaBit + anguloBit;
  console.log(alturaBit);
  console.log("doidera");
  res.send(result);

});

//POST
//return angle and heigth to arduino
// router.post('/guindaste/atributos',(req,res) => {
//   let novoRegistroBit = req.body.registro;
//   serial.write(novoRegistroBit);
//   console.log(novoRegistroBit);
//   res.send(novoRegistroBit);
// });

//POST
//return angle to arduino
router.post('/guindaste/angle',(req,res) => {
  let angulo = req.body.angulo;
  let estado = 3;
  let verifyPositiveOrNegative = parseInt(angulo, 2);
  if(verifyPositiveOrNegative < 0) {
     estado = 252;
  }
  estado = createBinaryString(estado);
  let anguloArduino = estado+angulo;
  res.send(anguloArduino);
});

//POST
//return heigth to arduino
router.post('/guindaste/heigth',(req,res) => {
  let altura = req.body.altura;
  let estado = 2;

  estado = createBinaryString(estado);
  let alturaArduino = estado+altura;
  res.send(200, alturaArduino);
});

//POST
//return eletroima stats(on/off) to arduino
router.post('/guindaste/eletroima',(req,res) => {
  let eletroima = req.body.eletroima;
  let verifyPositiveOrNegative = parseInt(eletroima, 2);
  let estado = 0; //Desligado
  if(verifyPositiveOrNegative > 0) {
    estado = 1; //Ligado
  }
  estado = createBinaryString(estado);
  estadoArduino = estado+eletroima;
  res.send(estadoArduino);
  // serialPort.write(estadoArduino);
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
