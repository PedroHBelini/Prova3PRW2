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
function autenticarToken(req, res, next) {
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
    const { username, password } = req.body;

    // procura usuário no "banco" local
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: "Usuário não encontrado!" });
    }

    // compara senha digitada com o hash salvo
    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
        return res.status(401).json({ message: "Senha inválida!" });
    }

    // gera token JWT contendo o username
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
});

//Rotas
// /alunos
app.get('/alunos', autenticarToken, (req, res) => {
    res.json(alunos);
});

// /alunos/medias
app.get('/alunos/medias', autenticarToken, (req, res) => {
    const medias = alunos.map(a => ({
        nome: a.nome,
        media: (a.nota1 + a.nota2) / 2
    }));
    res.json(medias);
});

// /alunos/aprovados
app.get('/alunos/aprovados', autenticarToken, (req, res) => {
    const result = alunos.map(a => {
        const media = (a.nota1 + a.nota2) / 2;

        return {
            nome: a.nome, 
            status: media >= 6 ? 'Aprovado' : 'Reprovado'
        };
    });
    res.json(result);
});

// /alunos/:id
app.get("/alunos/:id", autenticarToken, (req, res) => {
    const id = Number(req.params.id);
    const aluno = alunos.find(a => a.id === id);

    if (!aluno) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    res.json(aluno);
});

//Cria aluno
app.post("/alunos", autenticarToken, (req, res) => {
    alunos.push(req.body);
    res.json({ message: "Aluno cadastrado!" });
});

// Atualizar aluno
app.put("/alunos/:id", autenticarToken, (req, res) => {
    const id = Number(req.params.id);
    const index = alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    alunos[index] = req.body;
    res.json({ message: "Aluno atualizado!" });
});

// Deletar aluno
app.delete("/alunos/:id", autenticarToken, (req, res) => {
    const id = Number(req.params.id);
    const index = alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Aluno não encontrado!" });
    }

    alunos.splice(index, 1);
    res.json({ message: "Aluno removido!" });
});

//Cria servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});