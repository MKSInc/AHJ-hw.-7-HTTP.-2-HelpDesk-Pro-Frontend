export default class Modal {
  constructor() {
    this.docContainerEL = document.querySelector('[data-id="container"]');
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

  docContainerShade() {
    this.docContainerEL.dataset.visibility = 'shaded';
  }
}
