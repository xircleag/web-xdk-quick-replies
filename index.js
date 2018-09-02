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
      top: -35px;
      padding-right: 16px;
    }
    layer-quick-replies svg {
      width: 24px;
      height: 26px;
      border: solid 1px #ccc;
      border-radius: 0px 8px 8px 0px;
      cursor: pointer;
    }
    layer-quick-replies .layer-quick-replies-back-button {
      width: 24px;
      margin-left: 8px;
    }

    layer-quick-replies .layer-quick-replies-next-button {
      width: 24px;
      margin-right: 8px;
    }

    layer-quick-replies.layer-quick-replies-start .layer-quick-replies-back-button svg {
      display: none;
    }
    layer-quick-replies.layer-quick-replies-end .layer-quick-replies-next-button svg {
      display: none;
    }
    layer-quick-replies .layer-quick-replies-options {
      align-items: flex-start;
      justify-content: start;
      display: flex;
      flex-direction: row;
      flex-grow: 1;
      width: 100px;
      overflow: hidden;
    }

    layer-quick-replies.layer-quick-replies-start.layer-quick-replies-end .layer-quick-replies-options {
      justify-content: center;
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
      white-space: nowrap;
    }
    layer-quick-replies .layer-quick-replies-option:first-child {
      margin-left: 0px;
    }
    layer-quick-replies .layer-quick-replies-option:last-child {
      margin-right: 0px;
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
  template: `
    <span layer-id="prev" class="layer-quick-replies-back-button"><svg transform="rotate(180)" class="layer-svg-previous-arrow" width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g>
            <polygon class="layer-svg-fillable layer-svg-strokable" points="8.59 16.34 13.17 11.75 8.59 7.16 10 5.75 16 11.75 10 17.75"></polygon>
        </g>
    </svg></span>
    <div layer-id="options" class="layer-quick-replies-options"></div>
    <span layer-id="next" class="layer-quick-replies-next-button"><svg class="layer-svg-next-arrow" width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g>
        <polygon class="layer-svg-fillable layer-svg-strokable" points="8.59 16.34 13.17 11.75 8.59 7.16 10 5.75 16 11.75 10 17.75"></polygon>
      </g>
    </svg></span>
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
      this.nodes.next.addEventListener('click', this._scrollToNext.bind(this));
      this.nodes.prev.addEventListener('click', this._scrollToPrev.bind(this));
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
      this.nodes.options.innerHTML = '';
      this.parentComponent.toggleClass('layer-quick-replies-showing', this.items && this.items.length);
      (this.items || []).forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('layer-quick-replies-option');
        div.innerHTML = item.text;
        this.addClickHandler('option' + index, div, this._optionClicked.bind(this, item.model));
        this.nodes.options.appendChild(div);
      });
      this.scrollLeft = 0;
      this._updateScrollButtons();
    },
    _optionClicked(model) {
      model.send({ conversation: this.parentComponent.conversation });
      this.dismiss();
    },
    showItems(items) {
      this.nodes.options.innerHTML = '';
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
      this.nodes.options.innerHTML = '';
    },
    onAnimEnd() {
      this.dismiss();
    },

    _scrollToNext() {
      const width = this.nodes.options.clientWidth;
      const widthChange = Math.round(width * 2/3);
      Layer.UI.UIUtils.animatedScrollLeftTo(this.nodes.options, this.nodes.options.scrollLeft + widthChange, 200, this._updateScrollButtons.bind(this));
    },

    _scrollToPrev() {
      const width = this.nodes.options.clientWidth;
      const widthChange = Math.round(width * 2/3);
      Layer.UI.UIUtils.animatedScrollLeftTo(this.nodes.options, Math.max(0, this.nodes.options.scrollLeft - widthChange), 200, this._updateScrollButtons.bind(this));
    },
    _updateScrollButtons() {
      this.toggleClass('layer-quick-replies-start', this.nodes.options.scrollLeft === 0);
      this.toggleClass('layer-quick-replies-end',
      this.nodes.options.clientWidth + this.nodes.options.scrollLeft >= this.nodes.options.scrollWidth);
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