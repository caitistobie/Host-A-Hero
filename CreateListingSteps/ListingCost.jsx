import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, FastField, Form } from "formik";
import { ListingCostSchema } from "./validationSchema.js";

class ListingCost extends Component {
  submit = values => {
    this.props.handleChange(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  render() {
    if (this.props.values.currentStep !== 4) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingCostSchema}
          initialValues={this.props.values.formData}
          onSubmit={this.submit}
          isInitialValid={this.isInitialValid}
        >
          {props => {
            const { touched, errors, handleSubmit, isValid } = props;
            return (
              <Form onSubmit={handleSubmit}>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div className="row">
                    <div className="col-6">
                      <label>
                        <strong>Cost Per Night</strong>
                      </label>
                      <FastField
                        name="costPerNight"
                        placeholder="Cost Per Night"
                        type="number"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.costPerNight && touched.costPerNight && (
                        <span className="text-danger">{"Required"}</span>
                      )}
                    </div>
                    <div className="col-6">
                      <label>
                        <strong>Cost Per Week</strong>
                      </label>
                      <FastField
                        name="costPerWeek"
                        placeholder="Cost Per Week"
                        type="number"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.costPerWeek && touched.costPerWeek && (
                        <span className="text-danger">{"Required"}</span>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <label>
                        <strong>Check-In Time</strong>
                      </label>
                      <FastField
                        name="checkInTime"
                        placeholder="Check-In Time"
                        type="time"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.checkInTime && touched.checkInTime && (
                        <span className="text-danger">
                          {errors.checkInTime}
                        </span>
                      )}
                    </div>
                    <div className="col-6">
                      <label>
                        <strong>Check-Out Time</strong>
                      </label>
                      <FastField
                        name="checkOutTime"
                        placeholder="Check-Out Time"
                        type="time"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.checkOutTime && touched.checkOutTime && (
                        <span className="text-danger">
                          {errors.checkOutTime}
                        </span>
                      )}
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

ListingCost.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      costPerNight: PropTypes.number,
      costPerWeek: PropTypes.number,
      checkInTime: PropTypes.string,
      checkOutTime: PropTypes.string
    }),
    currentStep: PropTypes.number
  }),
  handleChange: PropTypes.func,
  next: PropTypes.func,
  prev: PropTypes.func
};

export default ListingCost;
