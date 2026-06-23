const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const caminhoBanco = path.join(__dirname, 'Escola_Ativa.db');

const db = new sqlite3.Database(caminhoBanco, (err) => {
    if (err) {
        console.error('Erro ao conectar ou criar o banco SQLite:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite local.');
        criarTabelasAutomaticamente();
    }
});

function criarTabelasAutomaticamente() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE,
            senha TEXT,
            tipo TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            serie VARCHAR(50),
            turma VARCHAR(50),
            nome TEXT UNIQUE,
            senha TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS professores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            nome TEXT UNIQUE,
            disciplina TEXT,
            senha TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS administradores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE,
            senha TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS sugestoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo VARCHAR(50),
            descricao TEXT,
            criador_id INTEGER,
            tipo_usuario VARCHAR(30)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS reclamacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            local VARCHAR(100),
            frequencia VARCHAR(50),
            descricao TEXT,
            criador_id INTEGER,
            tipo_usuario VARCHAR(30)
        )`);


        db.run(
            `INSERT OR IGNORE INTO administradores (nome, senha) VALUES (?, ?)`,
            ['Kelly Rodrigues', 'a2D0m2Ns6TrDr']
        );

        db.run(
            `INSERT OR IGNORE INTO administradores (nome, senha) VALUES (?, ?)`,
            ['Gustavo dos Santos', 'a2D0m2Ns6TrDr']
        );

        db.run(
            `INSERT OR IGNORE INTO administradores (nome, senha) VALUES (?, ?)`,
            ['Isadora Arruda', 'a2D0m2Ns6TrDr']
        );

        db.run(
            `INSERT OR IGNORE INTO administradores (nome, senha) VALUES (?, ?)`,
            ['Enzo Adriel', 'a2D0m2Ns6TrDr']
        );

        db.run(
            `INSERT OR IGNORE INTO administradores (nome, senha) VALUES (?, ?)`,
            ['Reinaldo de Souza', 'a2D0m2Ns6TrDr']
        );

        console.log('Verificação de tabelas concluída. Banco pronto para uso!');
    });
}

app.post('/cadastrar_alunos', (req, res) => {
    try {
        const {serie, turma, nome, senha } = req.body;

        const checarUsuario = `SELECT * FROM usuarios WHERE nome = ?`;

        db.get(checarUsuario, [nome], (erro, resultado) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
            }

            if (resultado) {
                return res.status(409).json({mensagem: 'Este nome já está cadastrado.'});
            }

            db.run(`INSERT INTO usuarios (nome, senha, tipo) VALUES (?, ?, ?)`, [nome, senha, 'aluno'], function(err){
                if (err){
                    return res.status(500).json({mensagem: 'Erro ao criar usuário.'});
                }

                const usuario_id = this.lastID;

                db.run(`INSERT INTO alunos (usuario_id, serie, turma, nome, senha) VALUES (?, ?, ?, ?, ?)`, [usuario_id, serie, turma, nome, senha], function(erroAluno){
                    if (erroAluno){
                        return res.status(500).json({mensagem: 'Erro ao salvar o aluno.'});
                    }

                    res.status(201).json({
                        mensagem: 'Cadastro realizado com sucesso!',
                        usuario_id: usuario_id,
                        tipo_usuario: 'aluno',
                        nome: nome
                    });
                });
            });
        });
    } catch(error) {
        res.status(500).json({mensagem: 'Erro inesperado no servidor.'});
    }
});

app.post('/cadastrar_professores', (req, res) => {
    try {
        const { nome, disciplina, senha } = req.body;
        const senhaEspecial = 'p2R0f2Ss6R';

        if (senha !== senhaEspecial) {
            return res.status(401).json({
                mensagem: 'Senha institucional incorreta.'
            });
        }

        const checarUsuario = `SELECT * FROM usuarios WHERE nome = ?`;

        db.get(checarUsuario, [nome], (erro, resultado) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).json({mensagem: 'Erro interno no servidor.'});
            }

            if (resultado) {
                return res.status(409).json({mensagem: 'Este nome já está cadastrado.'});
            }

            db.run(`INSERT INTO usuarios (nome, senha, tipo) VALUES (?, ?, ?)`, [nome, senha, 'professor'], function(err){
                if (err){
                    console.error('Erro no INSERT usuarios:', err.message);
                    return res.status(500).json({mensagem: 'Erro ao criar usuário.',
                        erro: err.message
                    });
                }

                const usuario_id = this.lastID;

                db.run(`INSERT INTO professores (usuario_id, nome, disciplina, senha) VALUES (?, ?, ?, ?)`, [usuario_id, nome, disciplina, senha], function(erroProfessor){
                    if (erroProfessor){
                        return res.status(500).json({mensagem: 'Erro ao salvar o professor.'});
                    }
                })

                res.status(201).json({
                    mensagem: 'Professor cadastrado com sucesso!',
                    usuario_id: usuario_id,
                    tipo_usuario: 'professor',
                    nome: nome
                });
            });
        });
    } catch(error) {
        res.status(500).json({mensagem: 'Erro inesperado no servidor.'});
    }
});

app.post('/acesso', (req, res) => {
    const { tipoUsuario, nome, senha } = req.body;

    const sql = `SELECT * FROM usuarios WHERE nome = ? AND senha = ?`;

    db.get(sql, [nome, senha], (erro, resultado) => {
        if (erro){
            return res.status(500).json({mensagem: 'Erro no banco.'});
        }

        if (!resultado){
            return res.status(401).json({mensagem: 'Usuário ou senha incorretos.'});
        }

        if (resultado.tipo !== tipoUsuario){
            return res.status(401).json({mensagem: 'Tipo de usuário incorreto.'});
        }
        
        if (resultado){
            return res.json({
                mensagem: 'Acesso realizado com sucesso!',
                usuario_id: resultado.id,
                tipo_usuario: resultado.tipo,
                nome: resultado.nome
            });
        }
    });
});

app.post('/enviar_sugestao', (req,res)=>{
    const {tipo, descricao, criador_id, tipo_usuario} = req.body;

    if (!criador_id || !tipo_usuario){
        return res.status(400).json({mensagem: 'Usuário não identificado.'});
    }

    const sql = `INSERT INTO sugestoes (tipo, descricao, criador_id, tipo_usuario) VALUES (?, ?, ?, ?)`;

    db.run(sql, [tipo, descricao, criador_id, tipo_usuario], function(err){
        if(err){
            return res.status(500).json({mensagem: 'Erro ao salvar sugestão.'});
        }

        res.status(201).json({mensagem: 'Sugestão enviada com sucesso!'});
    });
});

app.post('/enviar_reclamacao', (req,res)=>{
    const {local, frequencia, descricao, criador_id, tipo_usuario} = req.body;

    if (!criador_id || !tipo_usuario){
        return res.status(400).json({mensagem: 'Usuário não identificado.'});
    }

    const sql = `INSERT INTO reclamacoes (local, frequencia, descricao, criador_id, tipo_usuario) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [local, frequencia, descricao, criador_id, tipo_usuario], function(err){
        if(err){
            return res.status(500).json({mensagem: 'Erro ao salvar reclamação.'});
        }

        res.status(201).json({mensagem: 'Reclamação enviada!'});
    });
});

app.get('/listar_sugestoes', (req,res) => {
    db.all(`SELECT id, tipo, descricao, criador_id, tipo_usuario FROM sugestoes ORDER BY id DESC`, [], (err, resultados) => {
            if(err){
                return res.status(500).json({mensagem: 'Erro ao buscar sugestões.'});
            }

            res.json(resultados);
        }
    );
});

app.get('/listar_reclamacoes',(req,res)=>{
    db.all(`SELECT id, local, frequencia, descricao, criador_id, tipo_usuario FROM reclamacoes ORDER BY id DESC`, [], (err, resultados) => {
            if(err){
                return res.status(500).json({mensagem: 'Erro ao buscar reclamações.'});
            }

            res.json(resultados);
        }
    );
});

app.delete('/excluir_sugestao/:id/:usuario_id/:tipo', (req,res)=>{
    const id = req.params.id;
    const usuario_id = req.params.usuario_id;
    const tipo = req.params.tipo;

    const sql = `DELETE FROM sugestoes WHERE id = ? AND criador_id = ? AND tipo_usuario = ?`;

    db.run(sql, [id, usuario_id, tipo], function(err){
        if (err){
            return res.status(500).json({mensagem: 'Erro ao excluir.'});
        }

        if (this.changes === 0){
            return res.status(403).json({mensagem: 'Você não pode excluir essa sugestão.'});
        }

        res.json({mensagem: 'Sugestão excluída.'});
    });
});

app.delete('/excluir_reclamacao/:id/:usuario_id/:tipo', (req, res) => {
    const id = req.params.id;
    const usuario_id = req.params.usuario_id;
    const tipo = req.params.tipo;

    const sql = `DELETE FROM reclamacoes WHERE id = ? AND criador_id = ? AND tipo_usuario = ?`;

    db.run(sql, [id, usuario_id, tipo], function(err){
        if (err){
            return res.status(500).json({mensagem: 'Erro ao excluir.'});
        }

        if (this.changes === 0){
            return res.status(403).json({mensagem: 'Você não pode excluir essa reclamação.'});
        }

        res.json({mensagem: 'Reclamação excluída.'});
    })
});

app.listen(port, () => {
    console.log(`Servidor ativo e rodando em http://localhost:${port}`);
    console.log('Aguardando conexões do front-end...');
});
