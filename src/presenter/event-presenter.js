import EventsListItemView from '../view/events-list-item-view.js';
import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';
import { render, replace, remove } from '../framework/render.js';
import { getObjectFromArrayByKey } from '../utils/utils.js';
import { UserAction, UpdateType } from '../consts.js';
import { SortType } from '../utils/sort.js';

const Mode = {
  VIEW: 'view',
  EDIT: 'edit',
  NEW: 'new',
};

export default class EventPresenter {
  #container = null;
  #eventsModel = null;
  #destinations = null;
  #offers = null;
  #event = null;
  #eventsListItemComponent = null;
  #viewEventComponent = null;
  #editEventComponent = null;
  #onDataChange = null;
  #onModeChange = null;
  #mode = Mode.VIEW;
  #sort = null;

  constructor({ container, model, onDataChange, onModeChange }) {
    this.#container = container;
    this.#eventsModel = model;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
    this.#destinations = this.#eventsModel.destinations;
    this.#offers = this.#eventsModel.offers;

    this.#eventsListItemComponent = new EventsListItemView();
    render(this.#eventsListItemComponent, this.#container);
  }

  init(event, sort) {
    this.#event = event;
    this.#sort = sort;

    const prevViewEventComponent = this.#viewEventComponent;
    const prevEditEventComponent = this.#editEventComponent;
    const typeOffers = getObjectFromArrayByKey(this.#offers, 'type', this.#event.type).offers;
    const destinationName = getObjectFromArrayByKey(this.#destinations, 'id', this.#event.destination).name;

    this.#viewEventComponent = new EventView({
      event: { ... this.#event, destination: destinationName, typeOffers: typeOffers},
      onEdit: this.#onEdit,
      onSelect: this.#onSelect,
    });

    this.#editEventComponent = new EditEventView({
      event: this.#event,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#onFormSubmit,
      onFormReset: this.#onFormReset,
    });

    if (prevViewEventComponent === null || prevEditEventComponent === null) {
      render(this.#viewEventComponent, this.#eventsListItemComponent.element);
      return;
    }

    if (this.#mode === Mode.VIEW) {
      replace(this.#viewEventComponent, prevViewEventComponent);
    }

    if (this.#mode === Mode.EDIT) {
      replace(this.#editEventComponent, prevEditEventComponent);
    }

    remove(prevViewEventComponent);
    remove(prevEditEventComponent);
  }

  resetView() {
    if (this.#mode !== Mode.VIEW) {
      this.#changeEditToView();
    }
  }

  destroy() {
    remove(this.#eventsListItemComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
  }

  #changeViewToEdit() {
    replace(this.#editEventComponent, this.#viewEventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#onModeChange();
    this.#mode = Mode.EDIT;
  }

  #changeEditToView() {
    replace(this.#viewEventComponent, this.#editEventComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#mode = Mode.VIEW;
  }

  #onEscKeydown = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#editEventComponent.reset();
      this.#changeEditToView();
    }
  };

  #onEdit = () => {
    this.#changeViewToEdit();
  };

  #onSelect = () => {
    this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.PATCH, {...this.#event, isFavorite: !this.#event.isFavorite});
  };

  #onFormSubmit = (event) => {
    const isPriceChanged = this.#event.basePrice !== event.basePrice;
    const isDestinationChanged = this.#event.destination !== event.destination;
    const isStartDateChanged = this.#event.dateFrom !== event.dateFrom;
    const isEndDateChanged = this.#event.dateTo !== event.dateTo;
    const isEventTypeChanged = this.#event.type !== event.type;

    if (isEventTypeChanged & !isPriceChanged & !isDestinationChanged & !isStartDateChanged & !isEndDateChanged) {
      this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.PATCH, event);
    } else if (this.#sort === SortType.PRICE & !isPriceChanged ||
      this.#sort === SortType.DURATION & !isStartDateChanged & !isEndDateChanged ||
      this.#sort === SortType.DATE & !isStartDateChanged) {
      this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.MINOR, event);
    } else {
      this.#onDataChange(UserAction.UPDATE_EVENT, UpdateType.MAJOR, event);
    }

    this.#changeEditToView();
  };

  #onFormReset = () => {
    this.#changeEditToView();
  };
}
