import Messages from './Messages.js';

export default class Build {
    view(node) {
        const messages = node.attrs.messages;
        return m('.container.mt-1.message-window', m(Messages, {messages}));
    }
}
