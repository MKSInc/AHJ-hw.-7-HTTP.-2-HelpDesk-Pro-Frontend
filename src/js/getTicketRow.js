export default function getTicketRow(ticket) {
  const date = ticket.created.toLocaleDateString('ru', { year: '2-digit', month: 'numeric', day: 'numeric' });
  const time = ticket.created.toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric' });
  const trEl = document.createElement('tr');

  trEl.dataset.table = 'ticket-row';
  trEl.classList.add('help-desk__row');
  trEl.insertAdjacentHTML('afterbegin', `
    <td class="help-desk__cell">
      <button data-table="action" data-action="status" data-ticket-status="${ticket.status}" class="btn btn_type_round btn_action_status">
        <span data-visibility="v-hidden">Status</span>
      </button>
    </td>
    <td data-table="action" data-action="description" class="help-desk__cell help-desk__coll-name">
      <span>${ticket.name}</span>
      <p data-ticket="description" data-visibility="hidden" class="help-desk__description"></p>
    </td>
    <td class="help-desk__cell help-desk__coll-created">${date} ${time}</td>
    <td class="help-desk__cell">
      <button data-table="action" class="btn btn_type_round btn_action_edit">
        <span data-visibility="v-hidden">Edit</span>
      </button>
    </td>
    <td class="help-desk__cell">
      <button data-table="action" class="btn btn_type_round btn_action_delete">
        <span data-visibility="v-hidden">Delete</span>
      </button>
    </td>
   `);
  return trEl;
}
