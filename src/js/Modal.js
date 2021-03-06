/* eslint-disable max-len */
import HiddenTempEl from './utility';

export default class Modal {
  constructor(modalHTML) {
    // Общие элементы для всех модальных окон.
    this.els = {
      // Контейнер, растягивается на все окно клиента, блокируя взаимодействие с основным контентом,
      // также позволяет легко центрировать модальное окно с помощью flex.
      modal: null,

      // Элемент form
      form: null,

      // Кнопка отмены не подразумевающая возвращения какого-либо результата от формы.
      btnCancel: null,
    };

    this.selectors = {
      modal: '[data-modal="container"]',
      form: '[data-modal="form"]',
      btnCancel: '[data-action="cancel"]',
    };

    this.handlers = {
      onDocKeydown: this.onDocKeydown.bind(this),
    };

    this.resolve = null;

    // Контент, который будет затеняться с помощью opacity при активации модального окна.
    // Можно также затенять с помощью background-color: rgba на контейнере модального окна.
    // Выбор метода зависит от предпочитаемого визуального эффекта.
    this.docContainerEL = document.querySelector('[data-id="container"]');

    let ht = new HiddenTempEl(modalHTML);

    this.els.modal = ht.el.querySelector(this.selectors.modal);
    this.els.form = this.els.modal.querySelector(this.selectors.form);
    this.els.form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.els.btnCancel = this.els.form.querySelector(this.selectors.btnCancel);
    this.els.btnCancel.addEventListener('click', this.onBtnCancelClick.bind(this));

    document.body.append(this.els.modal);
    ht.el.remove();
    ht = null;

    // Определяем первый и последний элемент формы для табуляции внутри формы по кругу.
    // eslint-disable-next-line prefer-destructuring
    this.firstEl = this.els.form.elements[0];
    this.lastEl = this.els.form.elements[this.els.form.elements.length - 1];

    this.firstEl.addEventListener('keydown', this.onFirstElKeydown.bind(this));
    this.lastEl.addEventListener('keydown', this.onLastElKeydown.bind(this));
  }

  onFirstElKeydown(event) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.lastEl.focus();
    }
  }

  onLastElKeydown(event) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.firstEl.focus();
    }
  }

  onDocKeydown(event) {
    if (event.key === 'Escape') this.hide();
  }

  show() {
    document.addEventListener('keydown', this.handlers.onDocKeydown);
    this.docContainerEL.dataset.visibility = 'shaded';
    this.els.modal.removeAttribute('data-visibility');
    this.firstEl.focus();

    // Можно убрать прокрутку страницы во время показа модального окна.
    // В данном случае возможность прокрутки оставлена.
    // document.body.style.overflowY = 'hidden';

    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  hide(result) {
    this.resolve(result);
    document.removeEventListener('keydown', this.handlers.onDocKeydown);
    this.docContainerEL.removeAttribute('data-visibility');
    this.els.modal.dataset.visibility = 'hidden';

    // Вернуть прокрутку страницы после закрытия модального окна.
    // document.body.style.overflowY = '';
  }

  onBtnCancelClick(event) {
    event.preventDefault();
    this.hide();
  }

  // eslint-disable-next-line class-methods-use-this
  onFormSubmit(event) {
    event.preventDefault();
  }

  // Вариант центрирования модального окна (либо чего другого) через js.
  // В отличии от flex варианта, не требуется дополнительной обертки.
  // Оставлено для примера.
  // eslint-disable-next-line class-methods-use-this
  getModalCord(modalEL) {
    const { clientHeight, clientWidth } = document.documentElement;
    return {
      x: `${clientWidth / 2 - modalEL.offsetWidth / 2}px`,
      y: `${clientHeight / 2 - modalEL.offsetHeight / 2}px`,
    };
  }
}
