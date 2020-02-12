import React from "react";
import SingleListing from "./SingleListing";
import * as ListingsService from "../../services/listingService";
import swal from "sweetalert";
import PropTypes from "prop-types";
import Pagination from "./ListingsPagination";
import { Formik, FastField, Form, Field } from "formik";
import { Collapse, Button } from "reactstrap";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import GoogleMapReact from "google-map-react";
import ListingMarker from "./ListingMarker";
import moment from "moment";

import debug from "sabio-debug";

const _logger = debug.extend("Listings");

class Listings extends React.Component {
  state = {
    listings: [],
    activePage: 0,
    totalListingsPerPage: 9,
    totalCount: 0,
    editMode: false,
    view: false,
    myListing: {},
    radius: 15,
    isFilterOpen: false,
    housingType: [],
    center: {
      lat: "",
      lng: ""
    },
    startDate: null,
    endDate: null,
    filterGuests: 0,
    filterCost: 0,
    filterHousingType: 0,
    filterStartDate: 0,
    filterEndDate: 0
  };

  componentDidMount() {
    if (this.props.location.search && this.props.location.state.searchData) {
      let searchData = this.props.location.state.searchData;
      this.renderGeoListings(
        searchData.latitude,
        searchData.longitude,
        this.state.radius,
        this.state.activePage,
        this.state.totalListingsPerPage
      );
      this.getHousingTypes();
      this.setState(prevState => {
        return {
          ...prevState,
          searchData: searchData,
          center: {
            lat: this.props.location.state.searchData.latitude,
            lng: this.props.location.state.searchData.longitude
          }
        };
      });
    } else {
      this.renderListings(
        this.state.activePage,
        this.state.totalListingsPerPage
      );
      this.getHousingTypes();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.state !== this.props.location.state) {
      if (this.props.location.state) {
        let searchData = this.props.location.state.searchData;
        this.renderGeoListings(
          this.props.location.state.searchData.latitude,
          this.props.location.state.searchData.longitude,
          this.state.radius,
          0,
          this.state.totalListingsPerPage
        );
        this.setState(prevState => {
          return {
            ...prevState,
            searchData: searchData,
            center: {
              lat: this.props.location.state.searchData.latitude,
              lng: this.props.location.state.searchData.longitude
            }
          };
        });
      } else {
        this.renderListings(0, this.state.totalListingsPerPage);
      }
    }
  }

  getHousingTypes = () => {
    ListingsService.getAllHousingTypes()
      .then(this.onGetAllHousingTypesSuccess)
      .catch(this.onGetAllTypesError);
  };
  onGetAllHousingTypesSuccess = response => {
    _logger(response);
    this.setState(() => {
      return {
        housingType: response.item
      };
    });
  };
  onGetAllTypesError = errResponse => {
    _logger(errResponse);
  };

  setCurrentPage = pageNumber => {
    this.setState(
      () => {
        return { activePage: pageNumber - 1 };
      },
      () => {
        this.props.location.search
          ? this.renderGeoListings(
              this.props.location.state.searchData.latitude,
              this.props.location.state.searchData.longitude,
              this.state.radius,
              this.state.activePage,
              this.state.totalListingsPerPage
            )
          : this.renderListings(
              this.state.activePage,
              this.state.totalListingsPerPage
            );
      }
    );
  };

  updateFavorites = (pageIndex, pageSize) => {
    if (this.props.location.search) {
      let searchData = this.props.location.state.searchData;
      this.renderGeoListings(
        searchData.latitude,
        searchData.longitude,
        this.state.radius,
        pageIndex,
        pageSize
      );
    } else {
      this.renderListings(pageIndex, pageSize);
    }
  };

  mapListing = aListing => {
    let isSearch = this.props.location.search ? true : false;
    return (
      <SingleListing
        listing={aListing}
        key={aListing.id}
        viewMore={this.viewMore}
        images={aListing.images}
        isEditMode={this.state.editMode}
        totalPerPage={this.state.totalListingsPerPage}
        activePage={this.state.activePage}
        getFavoriteListings={this.updateFavorites}
        currentUser={this.props.currentUser}
        goToLogin={this.goToLogin}
        isSearch={isSearch}
      />
    );
  };

  goToLogin = () => {
    this.props.history.push("/login");
  };
  viewMore = listing => {
    this.props.history.push(`/listing/${listing.id}/viewmore`);
  };
  renderListings = (pageNumber, pageSize) => {
    ListingsService.getAllListings(pageNumber, pageSize)
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllError);
  };
  renderGeoListings = (latitude, longitude, radius, pageIndex, pageSize) => {
    ListingsService.getListingsByGeo(
      latitude,
      longitude,
      radius,
      pageIndex,
      pageSize
    )
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllError);
  };
  onGetAllSuccess = response => {
    _logger(response);
    let allListings = response.item.pagedItems;
    let newListings = allListings.map(this.mapListing);
    let mappedMarkers = allListings.map(this.mapMarker);
    this.setState(() => {
      return {
        listingsData: allListings,
        listings: newListings,
        totalCount: response.item.totalCount,
        mappedMarkers: mappedMarkers
      };
    });
    _logger("mapped markers", mappedMarkers);
  };

  onGetAllError = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        listings: "",
        listingsData: "",
        mappedMarkers: ""
      };
    });
    swal({
      title: "Failed to Find Listings",
      text: "Please search in a different location",
      icon: "error"
    });
  };

  onGetAllFilteredError = () => {
    swal({
      title: "Failed to Find Listings",
      text: "Try broadening your search",
      icon: "error"
    });
  };

  toggleFilter = () => {
    this.setState(() => {
      return { isFilterOpen: !this.state.isFilterOpen };
    });
  };

  filterListings = values => {
    let filterRadius = values.radius ? values.radius : this.state.radius;
    let filterGuests = values.guestCapacity ? values.guestCapacity : 0;
    let filterCost = values.cost ? values.cost : 0;
    let filterHousingType = values.housingType ? values.housingType : 0;
    let filterStartDate = this.state.startDate._d ? this.state.startDate._d : 0;
    let filterEndDate = this.state.endDate._d ? this.state.endDate._d : 0;
    this.setState(prevState => {
      return {
        ...prevState,
        radius: filterRadius,
        filterGuests: filterGuests,
        filterCost: filterCost,
        filterHousingType: filterHousingType,
        filterStartDate: moment(filterStartDate).format(),
        filterEndDate: moment(filterEndDate).format()
      };
    });

    ListingsService.getListingsByGeoByFilter(
      this.props.location.state.searchData.latitude,
      this.props.location.state.searchData.longitude,
      this.state.radius,
      this.state.activePage,
      this.state.totalListingsPerPage,
      this.state.filterGuests,
      this.state.filterCost,
      this.state.filterHousingType,
      this.state.filterStartDate,
      this.state.filterEndDate
    )
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllFilteredError);
  };

  selectDate = (startDate, endDate) => {
    this.setState(prevState => {
      return { ...prevState, startDate: startDate };
    });
    this.setState(prevState => {
      return { ...prevState, endDate: endDate };
    });
  };

  mapMarker = location => {
    return (
      <ListingMarker
        key={location.id}
        lat={location.listingLat}
        lng={location.listingLong}
        cost={location.costPerNight}
      />
    );
  };

  onChildClick = (key, childProps) => {
    _logger(childProps);
    let listingId = parseInt(key);
    let selectedListingIndex = this.state.listingsData.findIndex(
      listing => listingId === listing.id
    );
    this.setState(() => {
      let selectedListing = this.state.listings[selectedListingIndex];
      let listings = [...this.state.listings];
      listings.splice(selectedListingIndex, 1);
      listings.splice(0, 0, selectedListing);
      let selectedListingWithData = this.state.listingsData[
        selectedListingIndex
      ];
      let listingsData = [...this.state.listingsData];
      listingsData.splice(selectedListingIndex, 1);
      listingsData.splice(0, 0, selectedListingWithData);
      return { listings: listings, listingsData: listingsData };
    });
  };

  render() {
    _logger("render listings");
    return (
      <React.Fragment>
        <div className="Container">
          {this.state.searchData && this.props.location.search ? (
            <div>
              <div className="title mb-3">
                <Button onClick={this.toggleFilter} style={{ float: "right" }}>
                  <i className="pe-7s-plus" style={{ color: "white" }}></i>
                </Button>
                <h3>
                  Search Results for {this.state.searchData.city},{" "}
                  {this.state.searchData.state}
                </h3>
                <h6>Within a {this.state.radius} mile radius</h6>
                <div className="filterResults">
                  <Formik
                    enableReinitialize={true}
                    onSubmit={this.filterListings}
                  >
                    {props => {
                      const { handleSubmit } = props;
                      return (
                        <Form onSubmit={handleSubmit}>
                          <Collapse isOpen={this.state.isFilterOpen}>
                            <hr></hr>
                            <div className="row">
                              <div className="col-sm-12 col-lg-2">
                                <FastField
                                  name="guestCapacity"
                                  placeholder="Number of Guests"
                                  type="number"
                                  className="form-control"
                                  autoComplete="off"
                                />
                              </div>
                              <div className="col-sm-12 col-lg-2">
                                <FastField
                                  name="cost"
                                  placeholder="Cost Per Night"
                                  type="number"
                                  className="form-control"
                                  autoComplete="off"
                                />
                              </div>
                              <div className="col-sm-12 col-lg-2">
                                <Field
                                  name="housingType"
                                  placeholder="Type of Place"
                                  className="form-control"
                                  autoComplete="off"
                                  component="select"
                                  as="select"
                                >
                                  <option value={0}>Select</option>
                                  {this.state.housingType.map(housingType => (
                                    <option
                                      key={housingType.id}
                                      value={housingType.id}
                                    >
                                      {housingType.name}
                                    </option>
                                  ))}
                                </Field>
                              </div>
                              <div className="col-sm-12 col-lg-1">
                                <FastField
                                  name="radius"
                                  placeholder="Radius"
                                  type="number"
                                  className="form-control"
                                  autoComplete="off"
                                />
                              </div>
                              <div className="col-sm-12 col-lg-3">
                                <DateRangePicker
                                  startDate={this.state.startDate}
                                  startDateId="your_unique_start_date_id"
                                  endDate={this.state.endDate}
                                  endDateId="your_unique_end_date_id"
                                  onDatesChange={({ startDate, endDate }) =>
                                    this.selectDate(startDate, endDate)
                                  }
                                  focusedInput={this.state.focusedInput}
                                  onFocusChange={focusedInput =>
                                    this.setState({ focusedInput })
                                  }
                                  minimumNights={1}
                                  numberOfMonths={1}
                                  keepOpenOnDateSelect={true}
                                  enableOutsideDays={false}
                                  small={true}
                                />
                              </div>
                              <div className="col-sm-12 col-lg-2">
                                <Button
                                  type="submit"
                                  style={{ float: "right" }}
                                >
                                  Apply Filters
                                </Button>
                              </div>
                            </div>
                            <hr></hr>
                          </Collapse>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
              <div className="row">
                <div className="col-6">{this.state.listings}</div>{" "}
                <div className="col-6">
                  <div
                    className="card"
                    style={{
                      height: "750px",
                      width: "100%"
                    }}
                  >
                    <GoogleMapReact
                      bootstrapURLKeys={{
                        key: process.env.REACT_APP_GOOGLE_API_KEY
                      }}
                      center={this.state.center}
                      defaultZoom={11}
                      onChildClick={this.onChildClick}
                      yesIWantToUseGoogleMapApiInternals
                    >
                      {this.state.mappedMarkers}
                    </GoogleMapReact>
                  </div>
                </div>
              </div>
              <div>
                <Pagination
                  postsPerPage={this.state.totalListingsPerPage}
                  totalPosts={this.state.totalCount}
                  paginate={pageNumber => this.setCurrentPage(pageNumber)}
                />
              </div>
            </div>
          ) : (
            <div>
              {" "}
              <h3>Places to stay</h3>
              <div className="row">{this.state.listings}</div>
              <div>
                <Pagination
                  postsPerPage={this.state.totalListingsPerPage}
                  totalPosts={this.state.totalCount}
                  paginate={pageNumber => this.setCurrentPage(pageNumber)}
                />
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

Listings.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    roles: PropTypes.array,
    verteranStatus: PropTypes.string
  }),
  listing: PropTypes.shape({
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
    locationId: PropTypes.number.isRequired
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
    state: PropTypes.shape({
      searchData: PropTypes.shape({
        city: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        state: PropTypes.string
      })
    })
  })
};

export default Listings;
