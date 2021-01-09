import helpDeskHTML from '../html/help-desk.html';
import createRequest from './createRequest';
import getTicketRow from './getTicketRow';

export default class HelpDesk {
  constructor(parentEl) {
    this.parent = parentEl;
    this.els = {
      helpDesk: null,
      body: null,
      table: null,
    };

    this.selectors = {
      helpDesk: '[data-widget="help-desk"]',
      body: '[data-id="body"]',
      table: '[data-id="table"]',
    };

    this.ticketsID = new Map();
  }

  async init() {
    this.parent.insertAdjacentHTML('beforeend', helpDeskHTML);

    this.els.helpDesk = this.parent.querySelector(this.selectors.helpDesk);
    this.els.body = this.els.helpDesk.querySelector(this.selectors.body);
    this.els.table = this.els.body.querySelector(this.selectors.table);
    this.els.table.addEventListener('click', this.onTableClick.bind(this));

    console.log('HelpDesk This:', this);

    try {
      const allTickets = await createRequest({ params: { method: 'allTickets' } });
      console.log('Data:', allTickets);
      this.updateTable(allTickets);
      console.log(this.ticketsID);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
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
    console.log('target', event.target);
    const { target } = event;

    // Определяем было ли нажато на один из элементов, которые подразумевают ответное действие:
    // поменять статус, показать/скрыть описание, редактировать, удалить. Если нет - выходим.
    const actionEl = target.closest('[data-table="action"]');
    console.log('actionEl', actionEl);
    if (!actionEl) return;

    const ticketRowEl = actionEl.closest('[data-table="ticket-row"]');
    const ticketProp = this.ticketsID.get(ticketRowEl);

    // Если нажали на показать/скрыть описание.
    if (actionEl.dataset.action === 'description') {
      const ticketFullDescEl = actionEl.querySelector('[data-ticket="description"]');

      // Если полное описание нажатого тикета скрыто, то делаем запрос на сервер и показываем.
      if (!ticketProp.isFullDescShow) {
        try {
          const ticketById = await createRequest({ params: { method: 'ticketById', id: ticketProp.id } });
          ticketFullDescEl.innerText = ticketById.description;
          ticketFullDescEl.removeAttribute('data-visibility');
          ticketProp.isFullDescShow = true;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
        // Если полное описание тикета показано, то удаляем его.
      } else {
        ticketFullDescEl.dataset.visibility = 'hidden';
        ticketFullDescEl.innerText = '';
        ticketProp.isFullDescShow = false;
      }
    }

    if (actionEl.dataset.action === 'status') {
      const formData = new FormData();
      formData.append('method', 'changeStatus');
      formData.append('id', ticketProp.id);

      try {
        const ticketStatus = await createRequest({ formData });
        actionEl.dataset.ticketStatus = ticketStatus.status;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Не удалось поменять статус заявки.');
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }
}
