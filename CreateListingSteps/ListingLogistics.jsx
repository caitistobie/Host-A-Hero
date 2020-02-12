import React, { Component } from "react";
import logger from "sabio-debug";
import PropTypes from "prop-types";
import { Formik, FastField, Form, Field } from "formik";
import { ListingLogisticsSchema } from "./validationSchema.js";
import * as ListingService from "../../services/listingService.js";

const _logger = logger.extend("ListingLogistics");

class ListingLogistics extends Component {
  state = { accessType: [], housingType: [] };
  componentDidMount() {
    this.populateMenu();
  }
  populateMenu = () => {
    ListingService.getAllAccessTypes()
      .then(this.onGetAllAccessTypesSuccess)
      .catch(this.onGetAllTypesError);
    ListingService.getAllHousingTypes()
      .then(this.onGetAllHousingTypesSuccess)
      .catch(this.onGetAllTypesError);
  };
  onGetAllAccessTypesSuccess = response => {
    _logger(response);
    this.setState(() => {
      return {
        accessType: response.item
      };
    });
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
  submit = values => {
    this.props.handleChange(values, false);
    this.props.next();
  };
  isInitialValid = props => {
    return props.validationSchema.isValidSync(props.initialValues);
  };
  render() {
    if (this.props.values.currentStep !== 2) {
      return null;
    }
    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={ListingLogisticsSchema}
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
                        <strong>Bedrooms</strong>
                      </label>
                      <FastField
                        name="bedRooms"
                        placeholder="Number of Bedrooms"
                        type="number"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.bedRooms && touched.bedRooms && (
                        <span className="text-danger">{"Required"}</span>
                      )}
                    </div>
                    <div className="col-6">
                      <label>
                        <strong>Baths</strong>
                      </label>
                      <FastField
                        name="baths"
                        placeholder="Number of Baths"
                        type="number"
                        className="form-control"
                        autoComplete="off"
                      />
                      {errors.baths && touched.baths && (
                        <span className="text-danger">{"Required"}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label>
                      <strong>Guest Capacity</strong>
                    </label>
                    <FastField
                      name="guestCapacity"
                      placeholder="Maximum Number of Guests"
                      type="number"
                      className="form-control"
                      autoComplete="off"
                    />
                    {errors.guestCapacity && touched.guestCapacity && (
                      <span className="text-danger">{"Required"}</span>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <label>
                        <strong>Housing Type</strong>
                      </label>
                      <Field
                        name="housingTypeId"
                        className="form-control"
                        autoComplete="off"
                        component="select"
                        as="select"
                      >
                        <option value>Select</option>
                        {this.state.housingType.map(housingType => (
                          <option key={housingType.id} value={housingType.id}>
                            {housingType.name}
                          </option>
                        ))}
                      </Field>
                      {errors.housingTypeId && touched.housingTypeId && (
                        <span className="text-danger">{"Required"}</span>
                      )}
                    </div>
                    <div className="col-6">
                      <label>
                        <strong>Access Type</strong>
                      </label>
                      <Field
                        name="accessTypeId"
                        className="form-control"
                        autoComplete="off"
                        component="select"
                        as="select"
                      >
                        <option value>Select</option>
                        {this.state.accessType.map(accessType => (
                          <option key={accessType.id} value={accessType.id}>
                            {accessType.name}
                          </option>
                        ))}
                      </Field>
                      {errors.accessTypeId && touched.accessTypeId && (
                        <span className="text-danger">{"Required"}</span>
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

ListingLogistics.propTypes = {
  values: PropTypes.shape({
    formData: PropTypes.shape({
      bedRooms: PropTypes.number,
      baths: PropTypes.number,
      guestCapacity: PropTypes.number,
      housingTypeId: PropTypes.number,
      accessTypeId: PropTypes.number
    }),
    currentStep: PropTypes.number
  }),

  handleChange: PropTypes.func,
  next: PropTypes.func,
  prev: PropTypes.func
};

export default ListingLogistics;
