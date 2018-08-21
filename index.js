/**
 *
 * See the README!
 *
 */

//import Layer from '@layerhq/web-xdk';
const Layer = global.Layer || require('@layerhq/web-xdk');

Layer.UI.registerComponent('layer-quick-replies', {
  mixins: [Layer.UI.mixins.Clickable],
  style: `
    layer-quick-replies {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      height: 0px;
      position: relative;
      top: -38px;
    }
    layer-quick-replies .layer-quick-replies-option {
      opacity: 0.7;
      border: solid 1px #999;
      border-radius: 8px;
      padding: 4px 8px;
      margin: 0px 8px;
      background-color: white;
      color: #666;
      cursor: pointer;
    }
    layer-quick-replies.layer-quick-replies-dismiss {
      animation: quick-replies-fade-out 0.7s forwards;
      opacity: 0;
    }
    @keyframes quick-replies-fade-out {
      0% {
        opacity: 0.7;
      }
      100% {
        opacity: 0;
      }
    }
    layer-conversation-view.layer-quick-replies-showing .layer-typing-message {
      top: -8px;
    }
  `,
  properties: {
    items: {},
    fadesAfter: {
      value: 45000,
    },
    timeout: {},
  },
  methods: {
    onAfterCreate() {
      this.parentComponent.query.on('change:insert', this._onNewMessage, this);
      this.addEventListener('animationend', this.onAnimEnd.bind(this));
    },
    _onNewMessage(evt) {
      this.items = [];
      if (!evt.target.sender.isMine && evt.target._loadType === 'websocket') {
        this.trigger('layer-quick-replies-update', { message: evt.target });
      }
      if (!this.items.length) {
        this.fadeOut();
      }
    },
    onRerender() {
      this.innerHTML = '';
      this.parentComponent.toggleClass('layer-quick-replies-showing', this.items.length);
      (this.items || []).forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('layer-quick-replies-option');
        div.innerHTML = item.text;
        this.addClickHandler('option' + index, div, this._optionClicked.bind(this, item.model));
        this.appendChild(div);
      });
    },
    _optionClicked(model) {
      model.send({ conversation: this.parentComponent.conversation });
      this.dismiss();
    },
    showItems(items) {
      this.innerHTML = '';
      this.classList.remove('layer-quick-replies-dismiss');
      clearTimeout(this.timeout);
      this.items = items;
      this.onRerender();
      this.timeout = setTimeout(this.fadeOut.bind(this), this.fadesAfter);
    },
    fadeOut() {
      this.classList.add('layer-quick-replies-dismiss');
    },
    dismiss() {
      this.parentComponent.toggleClass('layer-quick-replies-showing', false);
      this.innerHTML = '';
    },
    onAnimEnd() {
      this.dismiss();
    },
  }
});

const ConversationViewMixin = {
  methods: {
    onCreate() {
      const quickReplies = document.createElement('layer-quick-replies');
      quickReplies.parentComponent = this;
      this.insertBefore(quickReplies, this.nodes.typingIndicators);
    },
  },
};

Layer.UI.setupMixins({
  'layer-conversation-view': ConversationViewMixin,
});