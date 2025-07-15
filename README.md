# CEO SYNC - Sistema de Gestão Corporativa

Um sistema completo de gestão corporativa desenvolvido com Next.js, TypeScript e Tailwind CSS, focado em facilitar a comunicação e organização em ambientes empresariais.

## 🚀 Funcionalidades

### 📅 Agenda Corporativa
- Calendário interativo com visualização mensal
- Criação e gerenciamento de reuniões
- Suporte para reuniões presenciais e online
- Sistema de convocação e convite de participantes
- Geração automática de links para reuniões online

### 💬 Chat Corporativo
- Mensagens em tempo real entre usuários
- Interface intuitiva com lista de contatos
- Histórico de conversas
- Indicadores de status online/offline
- Busca por contatos

### 👥 Gerenciamento de Usuários
- Sistema hierárquico (CEO, Diretores, Gerentes, Analistas, Assistentes)
- Controle de permissões baseado em níveis
- Edição de perfis de usuário
- Estatísticas de usuários online

### 📋 Sistema de Tarefas
- Criação e atribuição de tarefas
- Controle de status (Pendente, Em Progresso, Concluída)
- Sistema de prioridades
- Vinculação com reuniões
- Tags personalizáveis
- Alertas para tarefas atrasadas

### 🔔 Sistema de Notificações
- Notificações push no navegador
- Notificações em tempo real
- Configurações personalizáveis
- Diferentes tipos de notificação (reuniões, tarefas, mensagens)
- Sistema de lembretes automáticos

### 📊 Analytics e Relatórios
- Dashboard com métricas importantes
- Gráficos de participação e produtividade
- Análise de comunicação
- Relatórios de engajamento
- Horários de pico de atividade

### 🤖 Assistente IA
- Sugestões inteligentes para otimização
- Insights automáticos sobre agenda
- Recomendações de produtividade
- Análise de conflitos de horário

### 🎨 Interface Moderna
- Design responsivo
- Modo escuro/claro
- Componentes reutilizáveis com shadcn/ui
- Animações suaves
- Experiência de usuário otimizada

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Ícones**: Lucide React
- **Estado**: React Context API
- **Notificações**: Web Notifications API
- **Service Worker**: Para notificações avançadas

## 📦 Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/cscrm-ai/CEOSYNC.git
cd CEOSYNC
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Execute o projeto em modo de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# Supabase (opcional - para integração com banco de dados)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
\`\`\`

### Usuários Padrão

O sistema vem com usuários pré-configurados para demonstração:

- **CEO**: João Silva (nível 1)
- **Diretora**: Maria Santos (nível 2)
- **Gerente**: Pedro Costa (nível 3)
- **Analista**: Ana Oliveira (nível 4)
- **Assistente**: Carlos Lima (nível 5)

## 🏗️ Estrutura do Projeto

\`\`\`
CEOSYNC/
├── app/                    # App Router do Next.js
├── components/             # Componentes React
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── Agenda.tsx         # Componente da agenda
│   ├── Chat.tsx           # Sistema de chat
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── Tasks.tsx          # Gerenciamento de tarefas
│   └── ...
├── contexts/              # Contextos React
│   ├── AppContext.tsx     # Estado global da aplicação
│   ├── ThemeContext.tsx   # Gerenciamento de tema
│   └── NotificationContext.tsx
├── hooks/                 # Hooks customizados
├── types/                 # Definições TypeScript
├── lib/                   # Utilitários
├── public/                # Arquivos estáticos
└── scripts/               # Scripts SQL (Supabase)
\`\`\`

## 🎯 Como Usar

### 1. Dashboard
- Acesse a página inicial para ver um resumo das atividades
- Visualize estatísticas importantes
- Acompanhe reuniões próximas e tarefas urgentes

### 2. Agenda
- Navegue pelo calendário mensal
- Clique em uma data para ver reuniões do dia
- Use o botão "Nova Reunião" para agendar compromissos
- Convoque ou convide participantes conforme necessário

### 3. Chat
- Selecione um usuário na lista de contatos
- Digite mensagens no campo inferior
- Pressione Enter para enviar
- Veja o status online/offline dos usuários

### 4. Tarefas
- Crie novas tarefas com o botão "Nova Tarefa"
- Defina responsável, prazo e prioridade
- Acompanhe o progresso das tarefas
- Use filtros para organizar a visualização

### 5. Notificações
- Configure notificações push no navegador
- Receba alertas para reuniões próximas
- Acompanhe tarefas com prazo vencendo
- Personalize tipos de notificação

## 🔐 Níveis de Permissão

1. **CEO (Nível 1)**: Acesso total, pode editar todos os usuários
2. **Diretor (Nível 2)**: Pode gerenciar níveis inferiores
3. **Gerente (Nível 3)**: Pode gerenciar analistas e assistentes
4. **Analista (Nível 4)**: Acesso limitado às próprias tarefas
5. **Assistente (Nível 5)**: Acesso básico ao sistema

## 🚀 Deploy

### Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cscrm-ai/CEOSYNC)

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros Provedores

O projeto é compatível com qualquer provedor que suporte Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Integração com Google Calendar
- [ ] Sistema de aprovação de reuniões
- [ ] Relatórios avançados em PDF
- [ ] Aplicativo mobile
- [ ] Integração com Slack/Teams
- [ ] Sistema de backup automático
- [ ] API REST completa
- [ ] Testes automatizados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido por

**CSCRM AI** - Transformando a comunicação corporativa com inteligência artificial! 🚀

---

**CEO SYNC** - O futuro da gestão corporativa está aqui! 🌟
