import helpDeskHTML from '../html/help-desk.html';
import ModalTicket from './ModalTicket';
import ModalConfirm from './ModalConfirm';
import createRequest from './createRequest';
import getTicketRow from './getTicketRow';

export default class HelpDesk {
  constructor(parentEl) {
    this.parent = parentEl;
    this.els = {
      helpDesk: null,
      body: null,
      table: null,
      btnAdd: null,
    };

    this.selectors = {
      helpDesk: '[data-widget="help-desk"]',
      body: '[data-id="body"]',
      table: '[data-id="table"]',
      btnAdd: '[data-action="add"]',
      name: '[data-ticket="name"]',
      description: '[data-ticket="description"]',
      ticketRow: '[data-table="ticket-row"]',
      action: '[data-table="action"]',
    };

    this.modal = {
      ticket: null,
      confirm: null,
    };

    this.ticketsID = new Map();

    this.actionEl = null;
  }

  async init() {
    this.parent.insertAdjacentHTML('beforeend', helpDeskHTML);

    this.els.helpDesk = this.parent.querySelector(this.selectors.helpDesk);
    this.els.body = this.els.helpDesk.querySelector(this.selectors.body);

    this.els.table = this.els.body.querySelector(this.selectors.table);
    this.els.table.addEventListener('click', this.onTableClick.bind(this));

    this.els.btnAdd = this.els.helpDesk.querySelector(this.selectors.btnAdd);
    this.els.btnAdd.addEventListener('click', this.onBtnAddClick.bind(this));

    try {
      const allTickets = await createRequest({ params: { method: 'allTickets' } });
      if (!allTickets.success) throw new Error(allTickets.data);

      this.updateTable(allTickets.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    this.modal.ticket = new ModalTicket();
    this.modal.confirm = new ModalConfirm();
  }

  updateTable(allTickets) {
    this.els.table.innerHTML = '';
    const ticketRowEls = [];

    for (const ticket of allTickets) {
      const ticketRowEl = getTicketRow(ticket);
      ticketRowEls.push(ticketRowEl);
      this.ticketsID.set(ticketRowEl, {
        id: ticket.id,
        isFullDescShow: false,
      });
    }

    this.els.table.append(...ticketRowEls);
    ticketRowEls.length = 0;
  }

  async onTableClick(event) {
    // Определяем было ли нажато на один из элементов, которые подразумевают ответное действие:
    // поменять статус, показать/скрыть описание, редактировать, удалить. Если нет - выходим.
    this.actionEl = event.target.closest(this.selectors.action);
    if (!this.actionEl) return;

    const ticketRowEl = this.actionEl.closest(this.selectors.ticketRow);
    const ticketProp = this.ticketsID.get(ticketRowEl);
    const { action } = this.actionEl.dataset;

    switch (action) {
      case 'description': this.actionDescription({ ticketProp });
        return;
      case 'status': this.actionStatus({ ticketProp });
        return;
      case 'edit': this.actionEdit({ ticketRowEl, ticketProp });
        return;
      case 'delete': this.actionDelete({ ticketRowEl, ticketProp });
        return;
      // eslint-disable-next-line no-console
      default: console.error(`Действие (action=${action}) пользователя не определено!`);
    }
  }

  async actionDescription({ ticketProp }) {
    const ticketFullDescEl = this.actionEl.querySelector(this.selectors.description);

    // Если полное описание нажатого тикета скрыто, то делаем запрос на сервер и показываем.
    if (!ticketProp.isFullDescShow) {
      try {
        const ticketById = await createRequest({ params: { method: 'ticketById', id: ticketProp.id } });
        if (!ticketById.success) throw new Error(ticketById.data);

        const { description } = ticketById.data;
        if (description === '') return;
        ticketFullDescEl.innerText = description;
        ticketFullDescEl.removeAttribute('data-visibility');
        // eslint-disable-next-line no-param-reassign
        ticketProp.isFullDescShow = true;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Не удалось получить описание заявки.');
        // eslint-disable-next-line no-console
        console.error(e);
      }
      // Если полное описание тикета показано, то удаляем его.
    } else {
      ticketFullDescEl.dataset.visibility = 'hidden';
      ticketFullDescEl.innerText = '';
      // eslint-disable-next-line no-param-reassign
      ticketProp.isFullDescShow = false;
    }
  }

  async actionStatus({ ticketProp }) {
    const formData = new FormData();
    formData.append('method', 'changeStatus');
    formData.append('id', ticketProp.id);

    try {
      const ticketStatus = await createRequest({ formData });
      if (!ticketStatus.success) throw new Error(ticketStatus.data);

      this.actionEl.dataset.ticketStatus = ticketStatus.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Не удалось поменять статус заявки.');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async actionEdit({ ticketRowEl, ticketProp }) {
    try {
      const ticketById = await createRequest({ params: { method: 'ticketById', id: ticketProp.id } });
      if (!ticketById.success) throw new Error(ticketById.data);

      const formData = await this.modal.ticket.show(ticketById.data);
      if (!formData) return;

      formData.set('method', 'updateTicket');
      formData.set('id', ticketProp.id);
      this.actionEl.focus();

      const updateTicket = await createRequest({ formData });
      if (!updateTicket.success) throw new Error(updateTicket.data);

      // eslint-disable-next-line no-param-reassign
      ticketRowEl.querySelector(this.selectors.name).innerText = updateTicket.data.name;
      if (ticketProp.isFullDescShow) {
        // eslint-disable-next-line no-param-reassign
        ticketRowEl.querySelector(this.selectors.description)
          .innerText = updateTicket.data.description;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Не удалось получить данные редактируемой заявки.');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async actionDelete({ ticketRowEl, ticketProp }) {
    const result = await this.modal.confirm.show();
    if (!result) return;

    if (result === 'delete') {
      const formData = new FormData();
      formData.set('method', 'deleteTicket');
      formData.set('id', ticketProp.id);

      try {
        const deleteTicket = await createRequest({ formData });
        if (!deleteTicket.success) throw new Error(deleteTicket.dataset);

        ticketRowEl.remove();
        this.els.btnAdd.focus();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Не удалось удалить заявку.');
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }

  async onBtnAddClick() {
    // Показать модольное окно для создания тикета.
    const formData = await this.modal.ticket.show();
    this.els.btnAdd.focus();
    if (!formData) return;

    formData.set('id', null);
    formData.set('method', 'createTicket');

    try {
      const createTicket = await createRequest({ formData });
      if (!createTicket.success) throw new Error(createTicket.data);

      // Вариант без перерисовки всей таблицы после добавленя заявки.
      // Просто добавляется одна строка с новой заявкой.
      const ticketRowEl = getTicketRow(createTicket.data);
      this.ticketsID.set(ticketRowEl, {
        id: createTicket.data.id,
        isFullDescShow: false,
      });

      this.els.table.append(ticketRowEl);

      // Можно было бы также при созадании заявки возвращать с сервера все заявки
      // и обновлять таблицу одной строчкой, но тогда будет перерисовываться вся таблица
      // и будут закрыты все открытые описания.
      // this.updateTable(createTicket.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Не удалось добавить заявку.');
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}
