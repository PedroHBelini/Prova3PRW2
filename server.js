import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//Cria o app
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

//Middleware de autenticação
function autenticartoken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Token não fornecido!'

        });
    }
    //Verifica o token
    jwt.verify(token, JWT_SECRET, (err, usuario) => {
        if(err){
            return res.status(403).json({message: 'Token inválido!'});
        }
        req.usuario = usuario;
        next();
    });
}

//Post do /register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    //Valida os dados
    if(!username || !password){
        return res.status(400).json({message: 'Informe usuário e senha!'});
    }

    //Verifica se o usuário existe 
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({message: 'Usuário registrado!'});
});

//Post do /login
app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    //Valida usuário
    if(!username || !password){
        return res.status(400).json({message: 'Usuário não encontrado!'});
    }

    //verifica senha
    const senhaValida = await bcrypt.compare(password, user.password);

    if(!senhaValida){
        return res.status(401).json({message: 'Senha inválida!'});
    }

    //Gera o token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

//Rotas
// /alunos
app.get('/alunos', autenticartoken, (req, res) => {
    res.json(alunos);
});

// /alunos/medias
app.get('/alunos/medias', autenticartoken, (req, res) => {
    const medias = alunos.map(a => ({
        nome: a.nome,
        media: (a.nota1 + a.nota2) / 2
    }));
    res.json(medias);
});

// /alunos/aprovados
app.get('/alunos/aprovados', autenticartoken, (req, res) => {
    const aprovados = alunos.filter(a => {
        const media = (a.nota1 + a.nota2) / 2;

        return {
            nome: a.nome, 
            status: media >= 7 ? 'Aprovado' : 'Reprovado'
        };
    });
    res.json(aprovados);
});