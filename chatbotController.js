const data = require('./questionsData');

const userState = {}; // Store state per socket ID

function chatbotController(socket) {
  socket.on('user-message', (msg) => {
    const text = msg.trim().toLowerCase();

    if (!userState[socket.id]) {
      userState[socket.id] = { stage: 'greeting' };
    }

    const state = userState[socket.id];

    switch (state.stage) {
      case 'greeting':
        if (text === 'hi' || text === 'hey') {
          socket.emit('bot-message', 'Welcome! Tell me what I can help you with:');
          socket.emit('options', Object.keys(data));
          state.stage = 'main-options';
        } else {
          socket.emit('bot-message', 'Please say "hi" or "hey" to begin.');
        }
        break;

      case 'main-options':
        if (data[msg]) {
          state.category = msg;
          state.stage = 'show-questions';
          socket.emit('user-message', msg);
          socket.emit('bot-message', 'Here are some questions you can ask:');
          socket.emit('options', data[msg].questions);
        } else {
          socket.emit('bot-message', 'Please choose one of the given options.');
          socket.emit('options', Object.keys(data));
        }
        break;

      case 'show-questions':
        const answers = data[state.category].answers;
        if (answers[msg]) {
          socket.emit('user-message', msg);
          socket.emit('bot-message', answers[msg]);
          socket.emit('bot-message', 'Do you want to know more? (yes/no)');
          state.stage = 'more-query';
        } else {
          socket.emit('bot-message', 'Please choose a valid question.');
          socket.emit('options', data[state.category].questions);
        }
        break;

      case 'more-query':
        if (text === 'yes') {
          state.stage = 'main-options';
          socket.emit('bot-message', 'Sure! What topic do you want help with now?');
          socket.emit('options', Object.keys(data));
        } else if (text === 'no') {
          socket.emit('bot-message', 'Thank you for chatting! Have a great day! 👋');
          delete userState[socket.id];
        } else {
          socket.emit('bot-message', 'Please reply with "yes" or "no".');
        }
        break;
    }
  });

  socket.on('disconnect', () => {
    delete userState[socket.id];
    console.log(`User disconnected: ${socket.id}`);
  });
}

module.exports = chatbotController;
