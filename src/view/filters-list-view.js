import AbstractView from '../framework/view/abstract-view.js';

const ID_PREFIX = 'filter-';

const createFilterTemplate = ({ filter, isAvailable }, currentFilter) => {
  const disabledSign = !isAvailable ? 'disabled' : '';
  const checkedSign = filter === currentFilter ? 'checked' : '';

  return `<div class="trip-filters__filter">
    <input id="${ID_PREFIX}${filter}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter"
      value="${filter}" ${checkedSign} ${disabledSign}>
    <label class="trip-filters__filter-label" for="${ID_PREFIX}${filter}">${filter}</label>
  </div>`;
};

const createFiltersListTemplate = (filters, currentFilter) =>
  `<div class="trip-main__trip-controls  trip-controls">
      <div class="trip-controls__filters">
        <h2 class="visually-hidden">Filter events</h2>
        <form class="trip-filters" action="#" method="get">
          ${filters.map((filter) => createFilterTemplate(filter, currentFilter)).join('')}
          <button class="visually-hidden" type="submit">Accept filter</button>
        </form>
      </div>
    </div>
  </div>`;
export default class FiltersListView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #filterElements = null;

  constructor({ filters, currentFilter, callback }) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;

    this.#filterElements = this.element.querySelectorAll('.trip-filters__filter-input');

    this.element.querySelector('form').addEventListener('change', (evt) => {
      callback(evt.target.id.replace(ID_PREFIX, ''));
    });
  }

  get template() {
    return createFiltersListTemplate(this.#filters, this.#currentFilter);
  }

  update(filters) {
    this.#filterElements.forEach((input, index) => {
      input.disabled = !filters[index].isAvailable;
    });
  }
}
