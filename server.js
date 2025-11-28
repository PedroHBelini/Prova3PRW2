import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

//Chave Jwt
const JWT_SECRET = 'pedroEeduardo';

//Banco de dados local
const users = [];
const alunos = [
    { id: 1, nome: 'Pedro', ra: '123', nota1: 6, nota2: 9},
    { id: 2, nome: 'Eduardo', ra: '321', nota1: 6, nota2: 7},
    { id: 3, nome: 'Ramon', ra: '999', nota1: 2, nota2: 4}
];
