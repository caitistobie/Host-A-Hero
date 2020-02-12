import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, Form } from "formik";
import { ListingLocationSchema } from "./validationSchema.js";
import Amenities from "../amenities/Amenities";
import ListingsModal from "./ListingsModal";
import ViewListingGrid from "./ViewListingGrid";
import "./viewListingGrid.module.css";

class ListingReview extends Component {
  state = { modalIsOpen: false };
  submit = values => {
    this.props.create(values, true);
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  toggleModal = () => {
    this.setState(prevState => {
      return { modalIsOpen: !prevState.modalIsOpen };
    });
  };
  render() {
    if (this.props.values.currentStep !== 8) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingLocationSchema}
          initialValues={this.props.values.formData}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const { handleSubmit, isValid } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div>
                    <div>
                      <h2>Please Review your listing information below.</h2>
                      <h5>
                        This is what the user will see when looking at your
                        listing.
                      </h5>
                      <div className="row pr-0 mb-4">
                        <ViewListingGrid
                          images={this.props.values.formData.images}
                        />
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
                        <h2 className="mt-3 mb-3">
                          {this.props.values.formData.title}
                        </h2>
                        {/* <h4>
                          <i className="pe-7s-home btn-icon-wrapper"></i>{" "}
                          {this.props.values.housingType.name} with{" "}
                          {this.props.values.accessType.description}{" "}
                        </h4> */}
                        <h6 className="widget-heading opacity-7 mb-0">
                          {this.props.values.formData.guestCapacity} guests -{" "}
                          {this.props.values.formData.bedRooms} bedrooms -{" "}
                          {this.props.values.formData.baths} baths
                        </h6>
                        <hr></hr>
                        <h6 className="widget-heading opacity-7 mb-0">
                          {this.props.values.formData.description}
                        </h6>
                        <hr></hr>
                        {this.props.values.formData.listingsAdditional ? (
                          <h6 className="widget-heading opacity-7 mb-0">
                            <b>House Rules:</b>{" "}
                            {
                              this.props.values.formData.listingsAdditional
                                .houseRules
                            }{" "}
                            <b>Additional Info:</b>{" "}
                            {
                              this.props.values.formData.listingsAdditional
                                .additionalInfo
                            }
                          </h6>
                        ) : null}
                        <hr></hr>
                        {this.props.values.formData.amenities ? (
                          <Amenities
                            listingId={this.props.values.formData.id}
                            amenities={this.props.values.formData.amenities}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="clearfix mt-3">
                    <button
                      type="button"
                      className="btn-shadow btn-wide float-left btn-pill btn-hover-shine btn btn-secondary"
                      onClick={this.props.prev}
                    >
                      Previous
                    </button>
                    {this.props.values.formData.id ? (
                      <button
                        type="submit"
                        className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                        disabled={!isValid}
                      >
                        Update Listing
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                        disabled={!isValid}
                      >
                        Create Listing
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
        <ListingsModal
          images={this.props.values.formData.images}
          key={this.props.values.formData.id}
          toggle={this.toggleModal}
          isModalOpen={this.state.modalIsOpen}
          style={({ height: "100%" }, { width: "100%" })}
        />
      </React.Fragment>
    );
  }
}

ListingReview.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
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
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  prev: PropTypes.func,
  create: PropTypes.func
};

export default ListingReview;
