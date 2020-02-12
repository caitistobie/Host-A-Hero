import React from "react";
import PropTypes from "prop-types";
import "./singleListing.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import * as faStar2 from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as listingServices from "../../services/listingService";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import Carousel from "./ListingsCarousel";
import Swal2 from "sweetalert2";
library.add(fab, faStar);
library.add(fab, faStar2.faStar);

const SingleListing = props => {
  const selectedListingId = props.listing.id;
  const isFavoriteListing = props.listing.isFavorite;
  const viewListing = e => {
    e.preventDefault();
    props.viewMore(props.listing);
  };
  const checkIsFavorite = e => {
    e.preventDefault();
    if (props.currentUser.roles.indexOf("Anonymous") >= 0) {
      props.goToLogin();
    } else {
      if (isFavoriteListing) {
        listingServices
          .removeFromFavoriteListing(selectedListingId)
          .then(onremovefavoriteListingSuccess)
          .catch(onremovefavoriteListingError);
      } else {
        listingServices
          .addFavoriteListing(selectedListingId)
          .then(onAddFavoriteListingSuccess)
          .catch(onAddFavoriteListingError);
      }
    }
  };
  const onremovefavoriteListingSuccess = () => {
    toast("Removed from Favorite Listings");
    props.getFavoriteListings(props.activePage, props.totalPerPage);
  };
  const onremovefavoriteListingError = () => {
    Swal.fire(
      "Error",
      "Failed to remove from favorite listing! Please try again",
      "error"
    );
  };
  const onAddFavoriteListingSuccess = () => {
    toast("Added to Favorite Listings!");
    props.getFavoriteListings(props.activePage, props.totalPerPage);
  };
  const onAddFavoriteListingError = () => {
    toast("Sorry, Try Again to Save!");
  };
  const edit = e => {
    e.preventDefault();
    props.editListing(props.listing);
  };

  const makeInactive = e => {
    e.preventDefault();
    let listing = props.listing;
    Swal2.fire({
      title: "Are your sure?",
      text: props.listing.isActive
        ? "Making your listing Inactive will prohibit any users from viewing it moving forward."
        : "Making your listing Active will allow users to view and reserve your space moving forward.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33"
    }).then(value => {
      if (value.value) {
        props.makeInActive(listing);
      }
    });
  };
  return (
    <React.Fragment>
      {props.isEditMode ? (
        <div className="col-sm-12 col-lg-6 col-xl-4">
          <div
            className="mb-3 profile-responsive card fullCard"
            style={{
              backgroundColor: props.listing.isActive ? null : "#bbb",
              opacity: props.listing.isActive ? null : 0.5,
              height: "500px"
            }}
          >
            <div style={{ height: "250px" }}>
              <div className="d-flex" style={{ height: "100%" }}>
                <Carousel
                  images={props.listing.images}
                  style={({ height: "100%" }, { width: "100%" })}
                />
              </div>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item cardText">
                <div className="widget-content pt-1 pl-0 pr-0">
                  <div className="text-left">
                    <h6 className="widget-heading opacity-4 mb-0">
                      {props.listing.housingType.name} -{" "}
                      {props.listing.accessType.name}
                    </h6>
                    <h4 className="mt-3 mb-3">
                      <span className="pr-2">{props.listing.title}</span>
                    </h4>
                    <h6 className="widget-heading opacity-7 mb-0 pt-1">
                      {props.listing.guestCapacity} guests -{" "}
                      {props.listing.bedRooms} bedrooms - {props.listing.baths}{" "}
                      baths
                    </h6>
                  </div>
                </div>
              </li>
              <li className="p-0 list-group-item">
                <div className="grid-menu grid-menu-3col">
                  <div className="no-gutters row">
                    <div className="col-sm-4">
                      <button
                        className="btn-icon-vertical btn-square btn-transition br-bl btn"
                        onClick={viewListing}
                      >
                        <i className="pe-7s-home btn-icon-wrapper"> </i>
                        View More
                      </button>
                    </div>
                    <div className="col-sm-4">
                      <button
                        className="btn-icon-vertical btn-square btn-transition br-bl btn"
                        onClick={edit}
                      >
                        <i className="pe-7s-config btn-icon-wrapper"> </i>
                        Edit Listing
                      </button>
                    </div>
                    <div className="col-sm-4">
                      <button
                        className="btn-icon-vertical btn-square btn-transition br-bl btn"
                        onClick={makeInactive}
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Activate or decativate your listing from user view."
                      >
                        <i className="pe-7s-power btn-icon-wrapper"> </i>
                        {props.listing.isActive ? "Inactive?" : "Active?"}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div
          className={
            props.isSearch
              ? "col-sm-12 col-lg-12 col-xl-12"
              : "col-sm-12 col-lg-6 col-xl-4"
          }
        >
          <div className="mb-3 profile-responsive card">
            <div style={{ height: "250px" }}>
              <div className="d-flex" style={{ height: "100%" }}>
                <div
                  style={{
                    position: "absolute",
                    zIndex: 100,
                    padding: "0px 0px 0px 10px"
                  }}
                >
                  {isFavoriteListing ? (
                    <button
                      className="mb-3 mr-3 btn-icon btn-icon-only btn-shadow btn-outline-2x btn btn-outline-link btn-lg btnSaved"
                      style={{
                        height: "15px",
                        width: "10px",
                        marginLeft: "-17px",
                        marginTop: "0px"
                      }}
                      onClick={checkIsFavorite}
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        size="2x"
                        style={{ color: "gold" }}
                      ></FontAwesomeIcon>
                    </button>
                  ) : (
                    <button
                      className="mb-3 mr-3 btn-icon btn-icon-only btn-shadow btn-outline-2x btn btn-outline-link btn-lg btnSaved"
                      style={{
                        height: "15px",
                        width: "10px",
                        marginLeft: "-17px",
                        marginTop: "0px"
                      }}
                      onClick={checkIsFavorite}
                    >
                      <FontAwesomeIcon
                        icon={faStar2.faStar}
                        size="2x"
                        style={{ color: "gold" }}
                      ></FontAwesomeIcon>
                    </button>
                  )}
                </div>

                <Carousel
                  images={props.listing.images}
                  style={({ height: "100%" }, { width: "100%" })}
                />
              </div>
            </div>

            <ul className="list-group list-group-flush d-inline-block">
              <li className="list-group-item cardText">
                <div className="widget-content pt-1 pl-0 pr-0">
                  <div className="text-left">
                    <h6 className="widget-heading opacity-4 mb-0">
                      {props.listing.housingType.name} -{" "}
                      {props.listing.accessType.name}
                    </h6>
                    <h4 className="mt-3 mb-3">
                      <span className="pr-2">{props.listing.title}</span>
                    </h4>
                    <h6 className="widget-heading opacity-7 mb-0 pt-1">
                      {props.listing.guestCapacity} guests -{" "}
                      {props.listing.bedRooms} bedrooms - {props.listing.baths}{" "}
                      baths
                    </h6>
                  </div>
                </div>
              </li>
              <li className="p-0 list-group-item">
                <div className="grid-menu grid-menu-2col">
                  <div className="no-gutters row">
                    <div className="col-sm-6">
                      <button
                        className="btn-icon-vertical btn-square btn-transition br-bl btn btn-outline-link"
                        onClick={viewListing}
                      >
                        <i className="pe-7s-home btn-icon-wrapper"> </i>
                        View More
                      </button>
                    </div>
                    <div className="col-sm-6">
                      <h6 className="mt-4 mb-3 text-center center">
                        ${props.listing.costPerNight} / Night
                      </h6>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

SingleListing.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    roles: PropTypes.array,
    veteranStatus: PropTypes.string
  }),
  goToLogin: PropTypes.func,
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
    locationId: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        imageType: PropTypes.number,
        listingId: PropTypes.number,
        url: PropTypes.string
      })
    ),
    isFavorite: PropTypes.number
  }),
  viewMore: PropTypes.func,
  isEditMode: PropTypes.bool,
  editListing: PropTypes.func,
  makeInActive: PropTypes.func,
  activePage: PropTypes.number,
  totalPerPage: PropTypes.number,
  getFavoriteListings: PropTypes.func,
  isSearch: PropTypes.bool
};

export default SingleListing;
