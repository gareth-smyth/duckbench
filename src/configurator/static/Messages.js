export default class Messages {
    view(node) {
        const messages = node.attrs.messages;
        return messages.slice().reverse().map((message) => {
            let childCard;
            if (message.children.length) {
                childCard = m(`.card-body`, [
                    m(Messages, {messages: message.children})
                ]);
            }
            let estimatedPercent;
            if(message.percentComplete) {
                const timeForCurrentPercent = message.updateAt - message.startAt;
                const timePerPercent = timeForCurrentPercent / message.percentComplete;
                const timeSinceMostRecentUpdate = Date.now() - message.updateAt;
                estimatedPercent = message.percentComplete + (timePerPercent * timeSinceMostRecentUpdate);
            } else {
                const timeSinceStart = Date.now() - message.startAt;
                estimatedPercent =  100 / message.expectedTime * timeSinceStart;
            }
            return [
                m(`.card.bg-${message.type}`, [
                    m('.card-header', [
                        m('mb-0', [
                            m('.btn.btn-link.text-white', `${message.text}:${estimatedPercent}:${Date.now() - message.startAt}:${message.expectedTime}`),
                            m('.progress', [
                                m(`.progress-bar.progress-bar-striped${message.percentComplete < 100 ? '.progress-bar-animated' : ''}`, {
                                    role: 'progressbar',
                                    'aria-valuenow': `${estimatedPercent}`,
                                    'aria-valuemin': '0',
                                    'aria-valuemax': '100',
                                    style: `width: ${estimatedPercent}%`
                                })
                            ])
                        ])
                    ]),
                    childCard,
                ])
            ];
        });
    }
}
