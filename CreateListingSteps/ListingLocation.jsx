import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, Form } from "formik";
import { ListingLocationSchema } from "./validationSchema.js";
import LocationForm from "../locations/LocationForm";

class ListingLocation extends Component {
  submitPage = id => {
    this.props.handleLocation(id);
    this.props.next();
  };

  render() {
    if (this.props.values.currentStep !== 7) {
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
            const { handleSubmit } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div className="container">
                    <LocationForm
                      onChangeValue={this.submitPage}
                      onUpdateValue={this.props.next}
                      locationData={this.props.locationData}
                    />
                  </div>
                  <div className="clearfix mt-3">
                    <button
                      type="button"
                      className="btn-shadow btn-wide float-left btn-pill btn-hover-shine btn btn-secondary"
                      onClick={this.props.prev}
                    >
                      Previous
                    </button>
                    <button
                      disabled={!this.props.values.formData.locationId}
                      type="submit"
                      className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                      onClick={this.props.next}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </React.Fragment>
    );
  }
}

ListingLocation.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      locationId: PropTypes.number,
      id: PropTypes.number
    }),
    currentStep: PropTypes.number
  }),
  locationData: PropTypes.shape({
    id: PropTypes.number,
    locationType: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    lineOne: PropTypes.string,
    lineTwo: PropTypes.string,
    city: PropTypes.string,
    zip: PropTypes.string,
    state: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }),
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  handleLocation: PropTypes.func,
  prev: PropTypes.func,
  next: PropTypes.func
};

export default ListingLocation;
