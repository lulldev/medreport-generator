import React, { useState } from 'react'
import { TabContent, TabPane, Row, Col } from 'reactstrap'
import T from 'prop-types'

import { NavBar } from '../NavBar'
import { PatientDetails } from '../PatientDetails'
import { DoctorsAppointment } from '../DoctorsAppointment'

import { FIRST_NAV_TAB } from '@/constants/mainForm'

import './MainForm.scss'

const MainForm = props => {
  const [activeTab, handleToggle] = useState(FIRST_NAV_TAB)

  const {
    addPatient,
    showMesseageSuccess,
    showMesseageFill,
    updatePatient,
    patients,
  } = props

  return (
    <div className="main-form">
      <h2>Medrepot-generator</h2>
      <NavBar toggle={handleToggle} tabPosition={activeTab} />
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col sm="12">
              <DoctorsAppointment
                patients={patients}
                updatePatient={updatePatient}
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="12">
              <PatientDetails
                addPatient={addPatient}
                showMesseageSuccess={showMesseageSuccess}
                showMesseageFill={showMesseageFill}
              />
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </div>
  )
}

T.PropTypes = {
  addPatient: T.func.isRequired,
  showMesseageSuccess: T.func.isRequired,
  showMesseageFill: T.func.isRequired,
  updatePatient: T.func.isRequired,
  patients: T.Object,
}

export { MainForm }
