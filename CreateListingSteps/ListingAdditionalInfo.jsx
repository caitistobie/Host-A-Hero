import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, FastField, Form } from "formik";
import { ListingAdditionalInfoSchema } from "./validationSchema.js";
import AmenitiesForm from "../amenities/AmenitiesForm.jsx";

class ListingAdditionalInfo extends Component {
  submit = values => {
    this.props.handleChange(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  render() {
    if (this.props.values.currentStep !== 3) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingAdditionalInfoSchema}
          initialValues={this.props.values.formData.listingsAdditional}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const { handleSubmit, isValid, setFieldValue } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div>
                    <label
                      style={{ marginTop: 10, marginBottom: 10 }}
                      htmlFor="houseRules"
                    >
                      <strong>House Rules</strong>
                    </label>
                    <FastField
                      name="houseRules"
                      placeholder="Please list any rules about your property. (ex: Specific Noise Curfew, No Parties, No Additional Guests, etc)"
                      component="textarea"
                      className="form-control"
                    />
                    {props.touched.houseRules && props.errors.houseRules && (
                      <div className="text-danger">
                        {props.errors.houseRules}
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      style={{ marginTop: 10, marginBottom: 10 }}
                      htmlFor="additionalInfo"
                    >
                      <strong>Additional Info</strong>
                    </label>
                    <FastField
                      name="additionalInfo"
                      placeholder="Please list any additional information about your property. (ex: Street Cleaning on Monday's, Extra Blankets, etc)"
                      component="textarea"
                      className="form-control"
                    />
                    {props.touched.additionalInfo &&
                      props.errors.additionalInfo && (
                        <div className="text-danger">
                          {props.errors.additionalInfo}
                        </div>
                      )}
                  </div>
                  <label style={{ marginTop: 10, marginBottom: 10 }}>
                    <strong>Amenities</strong>
                  </label>
                  <AmenitiesForm
                    selectedAmenities={this.props.values.formData.amenitiesId}
                    handleAmenitiesChange={value =>
                      setFieldValue("amenitiesId", value)
                    }
                  />
                  <div className="clearfix mt-3">
                    <button
                      type="button"
                      className="btn-shadow btn-wide float-left btn-pill btn-hover-shine btn btn-secondary"
                      onClick={this.props.prev}
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      className="btn-shadow btn-wide float-right btn-pill btn-hover-shine btn btn-primary"
                      disabled={!isValid}
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

ListingAdditionalInfo.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      listingsAdditional: PropTypes.shape({
        additionalInfo: PropTypes.string,
        houseRules: PropTypes.string
      }),
      amenitiesId: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number
        })
      )
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  next: PropTypes.func,
  prev: PropTypes.func
};

export default ListingAdditionalInfo;
