import React from 'react';
import { connectModal } from 'redux-modal';

const CONFIRM_MODAL = 'confirm';

const Confirm = connectModal({ name: CONFIRM_MODAL })(props => {
  if (!props.show) return null;

  return (
    <React.Fragment>
      <div className="modal" style={{display: 'block'}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="row">
                <div className="col text-center">
                  {props.body || 'Are you sure?'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="container-fluid">
                <div className="row justify-content-center">
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn btn-primary m-1"
                      onClick={props.handleYes}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary m-1"
                      onClick={props.handleHide}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </React.Fragment>
  );
});

Confirm.modalName = CONFIRM_MODAL;

export default Confirm;