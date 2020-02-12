import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, FastField, Form } from "formik";
import { ListingAvailabilitySchema } from "./validationSchema.js";

class ListingAvailability extends Component {
  submit = values => {
    this.props.handleChange(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  render() {
    if (this.props.values.currentStep !== 5) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingAvailabilitySchema}
          initialValues={this.props.values.formData}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const {
              touched,
              errors,
              handleSubmit,
              handleBlur,
              values,
              isValid
            } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div>
                    <label>
                      <strong>Days Available</strong>
                    </label>
                    <FastField
                      name="daysAvailable"
                      placeholder="Days Available for Single Booking"
                      type="number"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.daysAvailable && touched.daysAvailable && (
                      <span className="text-danger">{"Required"}</span>
                    )}
                  </div>
                  <div className="p-1">
                    <label className="p-1">
                      <FastField
                        name="isActive"
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            className="checkbox"
                            onBlur={handleBlur}
                            autoComplete="off"
                            checked={values.isActive}
                          />
                        )}
                      />
                      Make my listing available immediately.
                    </label>
                    {errors.isActive && touched.isActive && (
                      <span className="text-danger">{errors.isActive}</span>
                    )}
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

ListingAvailability.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      daysAvailable: PropTypes.number,
      isActive: PropTypes.bool
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  next: PropTypes.func,
  prev: PropTypes.func
};

export default ListingAvailability;
