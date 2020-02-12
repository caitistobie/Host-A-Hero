import React, { Component } from "react";
import logger from "sabio-debug";
import ListingName from "./ListingName";
import ListingLogistics from "./ListingLogistics";
import ListingAdditionalInfo from "./ListingAdditionalInfo";
import ListingCost from "./ListingCost";
import ListingAvailability from "./ListingAvailability";
import ListingLocation from "./ListingLocation";
import ListingImages from "./ListingImages";
import ListingReview from "./ListingReview";
import PropTypes from "prop-types";
import { addListing, updateListing } from "../../services/listingService";
import * as LocationService from "../../services/locationsServices.js";
import swal from "sweetalert";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

const _logger = logger.extend("CreateListing");

class CreateListing extends Component {
  state = {
    formData: {
      internalName: "",
      title: "",
      shortDescription: "",
      description: "",
      bedRooms: null,
      baths: null,
      housingTypeId: null,
      accessTypeId: null,
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
    currentStep: 1,
    percent: 0
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    if (id) {
      let { state } = this.props.location;
      this.populateFormData(state);
      LocationService.getLocationById(this.props.location.state.locationId)
        .then(this.getLocationDataSuccess)
        .catch(this.getLocationDataError);
    }
  }
  getLocationDataSuccess = response => {
    this.setState(() => {
      return { locationData: response.item };
    });
  };
  getLocationDataError = errResponse => {
    _logger(errResponse);
  };

  populateFormData = state => {
    this.setState(prevState => {
      let newState = {
        ...prevState,
        formData: {
          internalName: state.internalName,
          title: state.title,
          shortDescription: state.shortDescription,
          description: state.description,
          bedRooms: state.bedRooms,
          baths: state.baths,
          housingTypeId: state.housingType.id,
          accessTypeId: state.accessType.id,
          guestCapacity: state.guestCapacity,
          costPerNight: state.costPerNight,
          costPerWeek: state.costPerWeek,
          checkInTime: state.checkInTime,
          checkOutTime: state.checkOutTime,
          daysAvailable: state.daysAvailable,
          locationId: state.locationId,
          isActive: state.isActive,
          id: state.id,
          images: state.images,
          listingsAdditional: state.listingsAdditional,
          amenitiesId: state.amenities
        },
        locationData: {}
      };
      return newState;
    });
  };

  handleChange = (values, shouldCall) => {
    this.setState(prevState => {
      let newState = { ...prevState, formData: { ...values } };
      if (shouldCall) {
        this.createListing(newState);
      }
      return newState;
    });
  };

  handleImages = values => {
    this.setState(prevState => {
      return {
        formData: {
          ...prevState.formData,
          images: values
        }
      };
    });
  };

  handleLocation = id => {
    this.setState(prevState => {
      return {
        formData: {
          ...prevState.formData,
          locationId: id
        }
      };
    });
  };

  handleAdditionalInfo = values => {
    let rules = values.houseRules;
    let info = values.additionalInfo;
    let amenities = values.amenitiesId;
    this.setState(prevState => {
      return {
        formData: {
          ...prevState.formData,
          listingsAdditional: { houseRules: rules, additionalInfo: info },
          amenitiesId: amenities
        }
      };
    });
  };

  next = () => {
    let currentStep = this.state.currentStep + 1;
    this.setState(() => {
      return {
        currentStep: currentStep,
        percent: this.state.percent + 12
      };
    });
  };

  prev = e => {
    e.preventDefault();
    let currentStep = this.state.currentStep - 1;

    this.setState(() => {
      return {
        currentStep: currentStep,
        percent: this.state.percent - 12
      };
    });
  };

  createListing = data => {
    if (!data.id) {
      addListing(data)
        .then(this.onCreateSuccess)
        .catch(this.onCreateError);
    } else {
      updateListing(data, data.id)
        .then(this.onUpdateSuccess)
        .catch(this.onUpdateError);
    }
  };
  onCreateSuccess = () => {
    swal({
      title: "Created New Listing!",
      icon: "success"
    });
    this.props.history.push(`/mylistings`);
  };
  onCreateError = errResponse => {
    swal({
      title: "Failed to Create Listing",
      text: "Please completely fill out the form",
      icon: "error"
    });
    _logger(errResponse);
  };
  onUpdateSuccess = () => {
    swal({
      title: "Updated Your Listing!",
      icon: "success"
    });
    this.props.history.push(`/mylistings`);
  };
  onUpdateError = errResponse => {
    swal({
      title: "Failed to Update Listing",
      text: "Make sure all fields are filled out",
      icon: "error"
    });
    _logger(errResponse);
  };

  render() {
    return (
      <div>
        <Progress
          percent={this.state.percent}
          style={{ margin: "0 0 10px 0" }}
          theme={{ active: { color: "#556B2F" } }}
        />
        <ListingName
          values={this.state}
          next={this.next}
          handleChange={this.handleChange}
        />
        <ListingLogistics
          values={this.state}
          handleChange={this.handleChange}
          next={this.next}
          prev={this.prev}
        />
        <ListingAdditionalInfo
          values={this.state}
          handleChange={this.handleAdditionalInfo}
          next={this.next}
          prev={this.prev}
        />
        <ListingCost
          values={this.state}
          handleChange={this.handleChange}
          next={this.next}
          prev={this.prev}
        />
        <ListingAvailability
          values={this.state}
          handleChange={this.handleChange}
          next={this.next}
          prev={this.prev}
        />
        <ListingImages
          values={this.state}
          handleChange={this.handleChange}
          handleImages={this.handleImages}
          prev={this.prev}
          next={this.next}
        />
        <ListingLocation
          values={this.state}
          handleLocation={this.handleLocation}
          next={this.next}
          prev={this.prev}
          locationData={this.state.locationData}
        />
        <ListingReview
          values={this.state}
          create={this.createListing}
          prev={this.prev}
        />
      </div>
    );
  }
}

CreateListing.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  children: PropTypes.shape({
    length: PropTypes.func
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string })
  }),
  location: PropTypes.shape({
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
          name: PropTypes.string
        })
      )
    })
  })
};

export default CreateListing;
