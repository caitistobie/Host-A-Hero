import React from "react";
import debug from "sabio-debug";
import PropTypes from "prop-types";
import swal from "sweetalert";
import ListingsModal from "./ListingsModal";
import * as ListingsService from "../../services/listingService";
import "./viewListingGrid.module.css";

import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import moment from "moment";
import { MDBBtn, MDBCollapse } from "mdbreact";

import * as ReservationsService from "../../services/reservationService";
import Amenities from "../amenities/Amenities";
import ViewListingGrid from "./ViewListingGrid";

import ReviewsByListingId from "../reviews/ReviewsByListingId";
import AvailableServices from "../availableServices/AvailableServices";
import { CardHeader, CardBody } from "reactstrap";

const _logger = debug.extend("ViewListing");

class ViewListing extends React.Component {
  state = {
    listing: {
      internalName: "",
      title: "",
      shortDescription: "",
      description: "",
      bedRooms: null,
      baths: null,
      housingType: "",
      accessType: "",
      guestCapacity: null,
      costPerNight: null,
      costPerWeek: null,
      checkInTime: "",
      checkOutTime: "",
      daysAvailable: null,
      locationId: null,
      isActive: false,
      images: [],
      listingsAdditional: {},
      amenitiesId: []
    },
    DateCheckIn: "",
    DateCheckOut: "",
    ChargeId: "1204 45a3 5875 3et3",
    calendarEvents: [],
    addedEvent: "default",
    pageIndex: 0,
    pageSize: 10,
    modalIsOpen: false,
    totalGuests: 1,
    adultValue: 1,
    childValue: 0,
    infantValue: 0,
    maxValue: 0,
    collapseID: "",
    reservation: []
  };

  componentDidMount() {
    if (this.props.match.params && this.props.match.params.id) {
      ReservationsService.getHostReservations(
        this.state.pageIndex,
        this.state.pageSize,
        this.props.match.params.id
      )
        .then(this.onGetHostReservationsSuccess)
        .catch(this.onGetHostReservationsFailure);
      ListingsService.getListingById(this.props.match.params.id)
        .then(this.getFullListingSuccess)
        .catch(this.getFullListingsError);
    } else {
      ListingsService.getListingById(this.props.match.params.myId)
        .then(this.getFullListingSuccess)
        .catch(this.getFullListingsError);
    }
  }
  getFullListingSuccess = response => {
    let listing = response.item;
    this.setState(prevState => {
      return { ...prevState, listing: listing };
    });
    this.setMaxValue();
    this.setTotalGuests();
  };
  getFullListingsError = errResponse => {
    _logger(errResponse);
    swal({
      title: "Failed to find your listing",
      icon: "error"
    });
  };

  onGetHostReservationsSuccess = result => {
    let reservedDates = [];

    result.data.item.pagedItems.forEach(element => {
      let dateCheckIn = element.dateCheckIn;
      let dateCheckOut = element.dateCheckOut;
      let dateIn = new Date(dateCheckIn);
      let dateOut = new Date(dateCheckOut);
      let diff = (dateOut - dateIn) / 86400000;
      _logger(diff);
      for (let i = 0; i < diff + 1; i++) {
        const newDate = new Date(dateIn.getTime() + i * 1000 * 60 * 60 * 24);
        reservedDates.push(
          `${newDate.getMonth() +
            1}/${newDate.getDate()}/${newDate.getFullYear()}`
        );
      }
      return reservedDates;
    });
    let mappedDate = reservedDates.map(item => {
      return item;
    });
    _logger(mappedDate);
    this.setState(() => {
      return {
        calendarEvents: mappedDate
      };
    });
  };

  getAmountOfDays = () => {
    var a = this.state.startDate._d;
    var b = this.state.endDate._d;
    var duration = moment.duration(b - a) / 86400000;

    this.setState(() => {
      return {
        amountOfDays: duration
      };
    });
  };

  onGetHostReservationsFailure = result => {
    _logger("There was an error getting Host Reservations", result);
  };

  isDayBlocked = day => {
    let blockedDays = this.state.calendarEvents;
    return blockedDays.some(unavailableDay =>
      moment(unavailableDay).isSame(day, "day")
    );
  };

  checkForBlockedDays = (startDate, endDate) => {
    let dates = this.state.calendarEvents;
    if (dates.length === 0)
      this.setState(() => {
        return {
          startDate,
          endDate
        };
      });
    else {
      this.setState(() => {
        return {
          startDate
        };
      });
      for (let i = 0; i < dates.length; i++) {
        const element = dates[i];

        if (moment(element).isBetween(startDate, endDate)) {
          return false;
        } else {
          this.setState(() => {
            return {
              endDate
            };
          });
        }
      }
    }
  };

  handleSubmit = event => {
    event.preventDefault();

    let data = {};
    data.ListingId = this.state.listing.id;
    data.DateCheckIn = this.state.startDate._d;
    data.DateCheckOut = this.state.endDate._d;
    data.statusId = 2;
    data.ChargeId = this.state.ChargeId;

    if (this.props.currentUser.roles.indexOf("Anonymous") >= 0) {
      this.props.history.push("/login");
    } else {
      ReservationsService.createReservation(data)
        .then(this.getAmountOfDays())
        .then(this.onCreateReservationSuccess)
        .catch(this.onCreateReservationFailure);
    }
  };

  onCreateReservationSuccess = result => {
    _logger("Successfuly submitted reservation", result);
    let reservation = {};

    reservation.reservationId = result.data.item;
    reservation.name = this.state.listing.internalName;
    reservation.description = this.state.listing.description;
    reservation.amount =
      this.state.listing.costPerNight * this.state.amountOfDays;
    reservation.currency = "usd";
    reservation.quantity = this.state.amountOfDays;
    reservation.images = this.state.listing.images;
    reservation.guests = this.state.totalGuests;
    reservation.infants = this.state.infantValue;
    reservation.checkInTime = this.state.listing.checkInTime;
    reservation.checkOutTime = this.state.listing.checkOutTime;

    this.setState(() => {
      return {
        reservations: reservation
      };
    });
    let thisReservation = this.state.reservations;
    _logger(thisReservation);
    this.props.history.push("/reservation/review", thisReservation);
  };

  onCreateReservationFailure = result => {
    _logger("There was an error submitting reservation", result);
    swal("Error", "If problem persists please contact Administrator.", "error");
  };

  setMaxValue = () => {
    if (this.state.listing.id) {
      this.setState(() => {
        return {
          maxValue: this.state.listing.guestCapacity
        };
      });
    }
  };

  increaseAdult = () => {
    if (this.state.adultValue + this.state.childValue < this.state.maxValue)
      this.setState(() => {
        return {
          adultValue: this.state.adultValue + 1
        };
      });
  };

  decreaseAdult = () => {
    if (this.state.adultValue > 1)
      this.setState(() => {
        return {
          adultValue: this.state.adultValue - 1
        };
      });
  };

  increaseChild = () => {
    if (this.state.childValue + this.state.adultValue < this.state.maxValue)
      this.setState(() => {
        return {
          childValue: this.state.childValue + 1
        };
      });
  };

  decreaseChild = () => {
    if (this.state.childValue > 0)
      this.setState(() => {
        return {
          childValue: this.state.childValue - 1
        };
      });
  };

  increaseInfant = () => {
    if (this.state.infantValue < 9)
      this.setState(() => {
        return {
          infantValue: this.state.infantValue + 1
        };
      });
  };

  decreaseInfant = () => {
    if (this.state.infantValue > 0)
      this.setState(() => {
        return {
          infantValue: this.state.infantValue - 1
        };
      });
  };

  toggleCollapse = collapseID => () => {
    this.setState(prevState => ({
      collapseID: prevState.collapseID !== collapseID ? collapseID : ""
    }));
  };

  editListing = e => {
    e.preventDefault();
    let listing = this.state.listing;
    this.props.history.push(`/listing/${listing.id}/edit`, listing);
  };

  setTotalGuests = () => {
    let adults = this.state.adultValue;
    let children = this.state.childValue;
    let totalCount = adults + children;

    this.setState(() => {
      return {
        totalGuests: totalCount
      };
    });
  };
  toggleModal = () => {
    this.setState(prevState => {
      return { modalIsOpen: !prevState.modalIsOpen };
    });
  };

  render() {
    _logger("rendering");
    return (
      <React.Fragment>
        {this.props.match.params.myId ? (
          <div className="row">
            <div className="col-sm-12">
              <div className="row pr-0 mb-4">
                <ViewListingGrid images={this.state.listing.images} />
                <button
                  type="button"
                  className="btn col-md-1 col-sm-12 btn btn-outline-primary mx-2 mb-3"
                  id="toggleForm"
                  onClick={this.toggleModal}
                >
                  View All
                </button>
              </div>
              <div>
                <h2 className="mt-3 mb-3">{this.state.listing.title}</h2>
                <h4>
                  <i className="pe-7s-home btn-icon-wrapper"></i>{" "}
                  {this.state.listing.housingType.name} with{" "}
                  {this.state.listing.accessType.description}{" "}
                </h4>
                <h6 className="widget-heading opacity-7 mb-0">
                  {this.state.listing.guestCapacity} guests -{" "}
                  {this.state.listing.bedRooms} bedrooms -{" "}
                  {this.state.listing.baths} baths
                </h6>
                <hr></hr>
                <h6 className="widget-heading opacity-7 mb-0">
                  {this.state.listing.description}
                </h6>
                <hr></hr>
                {this.state.listing.listingsAdditional ? (
                  <h6 className="widget-heading opacity-7 mb-0">
                    <b>House Rules:</b>{" "}
                    {this.state.listing.listingsAdditional.houseRules}{" "}
                    <b>Additional Info:</b>{" "}
                    {this.state.listing.listingsAdditional.additionalInfo}
                  </h6>
                ) : null}
                <hr></hr>
                {this.state.listing.amenities ? (
                  <Amenities
                    listingId={this.state.listing.id}
                    amenities={this.state.listing.amenities}
                  />
                ) : null}
              </div>
              <div className="clearfix mt-3">
                <button
                  className="btn-shadow-primary btn btn-primary btn-lg"
                  onClick={this.editListing}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="row">
              <div className="col-lg-8 col-sm-12">
                <div className="row pr-0 mb-4">
                  <ViewListingGrid images={this.state.listing.images} />
                  <button
                    type="button"
                    className="btn col-md-1 col-sm-12 btn btn-outline-primary mx-2 mb-3"
                    id="toggleForm"
                    onClick={this.toggleModal}
                  >
                    View All
                  </button>
                </div>
                <div>
                  <h2 className="my-3">{this.state.listing.title}</h2>
                  <h4>
                    <i className="pe-7s-home btn-icon-wrapper"></i>{" "}
                    {this.state.listing.housingType.name} with{" "}
                    {this.state.listing.accessType.description}{" "}
                  </h4>
                  <h6 className="widget-heading opacity-7 mb-0">
                    {this.state.listing.guestCapacity} guests -{" "}
                    {this.state.listing.bedRooms} bedrooms -{" "}
                    {this.state.listing.baths} baths
                  </h6>
                  <hr></hr>
                  <h6 className="widget-heading opacity-7 mb-0">
                    {this.state.listing.description}
                  </h6>
                  <hr></hr>
                  {this.state.listing.listingsAdditional ? (
                    <h6 className="widget-heading opacity-7 mb-0">
                      <b>House Rules:</b>{" "}
                      {this.state.listing.listingsAdditional.houseRules}{" "}
                      <b>Additional Info:</b>{" "}
                      {this.state.listing.listingsAdditional.additionalInfo}
                    </h6>
                  ) : null}
                  <hr></hr>
                  {this.state.listing.amenities ? (
                    <Amenities
                      listingId={this.state.listing.id}
                      amenities={this.state.listing.amenities}
                    />
                  ) : null}
                  <div style={{ paddingTop: "40px" }}>
                    {this.state.listing.id ? (
                      <AvailableServices
                        listingInfo={this.props}
                        listing={this.state.listing}
                      />
                    ) : null}
                  </div>
                  <hr />
                  <div style={{ paddingTop: "40px" }}>
                    {this.state.listing.id ? (
                      <ReviewsByListingId
                        listingInfo={this.props}
                        listing={this.state.listing}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-sm-12">
                <div
                  className={
                    window.innerWidth < 992
                      ? "mb-3 profile-responsive card fullCard p-2 mr-2 mt-5"
                      : "mb-3 profile-responsive card fullCard p-2 mr-2 position-fixed"
                  }
                >
                  <CardHeader className="p-1">
                    <h4>${this.state.listing.costPerNight}</h4>
                    <div>per night</div>
                  </CardHeader>
                  <CardBody>
                    <div>Dates</div>
                    <DateRangePicker
                      startDate={this.state.startDate}
                      startDateId="your_unique_start_date_id"
                      endDate={this.state.endDate}
                      endDateId="your_unique_end_date_id"
                      onDatesChange={({ startDate, endDate }) =>
                        this.checkForBlockedDays(startDate, endDate)
                      }
                      focusedInput={this.state.focusedInput}
                      onFocusChange={focusedInput =>
                        this.setState({ focusedInput })
                      }
                      isDayBlocked={day => this.isDayBlocked(day)}
                      minimumNights={1}
                      numberOfMonths={2}
                      keepOpenOnDateSelect={false}
                      enableOutsideDays={false}
                      showClearDates={true}
                      reopenPickerOnClearDates={true}
                    />
                    <div>Guests</div>
                    <MDBBtn
                      color="white"
                      className="border"
                      onClick={this.toggleCollapse("basicCollapse")}
                      style={{
                        marginBottom: "1rem",
                        width: 317,
                        height: 46,
                        borderRadius: 2
                      }}
                    >
                      {this.state.adultValue === 1
                        ? `${this.state.adultValue} Guest`
                        : `${this.state.childValue +
                            this.state.adultValue} Guests`}
                      {this.state.infantValue > 1
                        ? `, ${this.state.infantValue} Infants`
                        : ""}
                      {this.state.infantValue === 1
                        ? `, ${this.state.infantValue} Infant`
                        : ""}{" "}
                    </MDBBtn>
                    <MDBCollapse
                      id="basicCollapse"
                      isOpen={this.state.collapseID}
                    >
                      <div value={this.state.totalGuests}>
                        <div>
                          Adults
                          <div className="float-right">
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.decreaseAdult}
                            >
                              -
                            </button>
                            &nbsp;&nbsp;{this.state.adultValue}&nbsp;&nbsp;
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.increaseAdult}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <hr></hr>
                        <div>
                          Children
                          <div className="float-right">
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.decreaseChild}
                            >
                              -
                            </button>
                            &nbsp;&nbsp;{this.state.childValue}&nbsp;&nbsp;
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.increaseChild}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <hr></hr>
                        <div>
                          Infants
                          <div className="float-right">
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.decreaseInfant}
                            >
                              -
                            </button>
                            &nbsp;&nbsp;{this.state.infantValue}&nbsp;&nbsp;
                            <button
                              className="btn-primary"
                              style={{
                                borderRadius: 50,
                                width: 25,
                                height: 25
                              }}
                              type="button"
                              onClick={this.increaseInfant}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <hr></hr>
                        <div>
                          {this.state.maxValue} guest maximum. Infants will not
                          count towards the total number of guests.
                        </div>
                      </div>
                    </MDBCollapse>
                    <hr></hr>
                    <button
                      type="button"
                      disabled={!this.state.endDate}
                      onClick={this.handleSubmit}
                      className="btn btn-primary"
                      style={{ marginBottom: "1rem", width: 317, height: 46 }}
                    >
                      Reserve
                    </button>
                  </CardBody>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
        <ListingsModal
          images={this.state.listing.images}
          key={this.state.listing.id}
          toggle={this.toggleModal}
          isModalOpen={this.state.modalIsOpen}
          style={({ height: "100%" }, { width: "100%" })}
        />
      </React.Fragment>
    );
  }
}

ViewListing.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  edit: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      id: PropTypes.number,
      internalName: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      shortDescription: PropTypes.string.isRequired,
      description: PropTypes.string,
      bedRooms: PropTypes.number.isRequired,
      baths: PropTypes.number.isRequired,
      guestCapacity: PropTypes.number.isRequired,
      housingType: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      }),
      accessType: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
      }),
      costPerNight: PropTypes.number.isRequired,
      costPerWeek: PropTypes.number,
      checkInTime: PropTypes.string.isRequired,
      checkOutTime: PropTypes.string.isRequired,
      daysAvailable: PropTypes.number.isRequired,
      isActive: PropTypes.bool.isRequired,
      locationId: PropTypes.number.isRequired,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          imageType: PropTypes.number,
          listingId: PropTypes.number,
          url: PropTypes.string
        })
      ),
      listingsAdditional: PropTypes.shape({
        id: PropTypes.number,
        additionalInfo: PropTypes.string,
        houseRules: PropTypes.string
      }),
      amenities: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
          iconThumb: PropTypes.string
        })
      )
    })
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string, myId: PropTypes.string })
  }),
  onDatesChange: PropTypes.func,
  onFocusChange: PropTypes.func,
  isDayBlocked: PropTypes.func,
  currentUser: PropTypes.shape({
    roles: PropTypes.string,
    indexOf: PropTypes.func
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    roles: PropTypes.array,
    veteranStatus: PropTypes.string
  })
};

export default ViewListing;
