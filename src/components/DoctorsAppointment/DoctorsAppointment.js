import React, { useState } from 'react'
import T from 'prop-types'

import Select from 'react-select'
import { Button, Form, FormGroup, Label, Input, Col, Row } from 'reactstrap'

import { SelectServices } from '@/components/SelectServices'
import { SelectDiagnoses } from '@/components/SelectDiagnoses'

import {
  COUT_DAYS,
  MIN_DAY,
  getPatientByName,
  getPatientIdByValue,
  getSelectedPatients,
  SERVICES_FIELD,
  DIAGNOSES_FIELD,
} from '@/constants/mainForm'
import { SUCCES_GENERATION } from '@/constants/app'

import { generateFile } from '@/api'

import './DoctorsAppointment.scss'

const DoctorsAppointment = props => {
  const [idPatient, setIdPatient] = useState('')
  const [maxDay, setMaxDay] = useState(MIN_DAY)
  const [currentDay, setCurrentDay] = useState(MIN_DAY)
  const [pages, setPages] = useState([])
  const [doctor, setDoctor] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')
  const [dateReceipt, setDateReceipt] = useState(null)

  const doctorList = window.doctorList
  const officeAddressList = window.officeAddressList
  const { patients, updatePatient, showMesseageSuccess } = props

  const selectPatientList = getSelectedPatients(patients)

  const handleChangePatient = e => {
    const patient = getPatientByName(patients, e.value)
    const patientId = getPatientIdByValue(patients, patient)
    setIdPatient(patientId)
  }

  const handleServicesChange = e => {
    updatePatient(idPatient, e, SERVICES_FIELD)
  }

  const handleDiagnosesChange = e => {
    updatePatient(idPatient, e, DIAGNOSES_FIELD)
  }

  const onSubmitForm = e => {
    e.preventDefault()
    const newPage = {
      services: patients[idPatient].services,
      diagnoses: patients[idPatient].diagnoses,
      doctor: doctor,
      officeAddress: officeAddress,
      dateReceipt: dateReceipt,
    }

    pages.push(newPage)
    setCurrentDay(currentDay + 1)

    if (currentDay === maxDay) {
      generateFile(pages, patients[idPatient])
      setCurrentDay(MIN_DAY)
      setPages([])
      showMesseageSuccess(SUCCES_GENERATION)
    }
  }

  return (
    <Form onSubmit={onSubmitForm}>
      <Row form className="input-label">
        <Col>
          <h4>Input info for {currentDay} day:</h4>
        </Col>
        <Col>
          <Label>Number of pages in report file:</Label>
          <Select
            options={COUT_DAYS}
            onChange={e => setMaxDay(e.value)}
            placeholder="choose count days..."
            defaultValue={{
              value: 1,
              label: '1',
            }}
            isDisabled={currentDay !== MIN_DAY}
          />
        </Col>
      </Row>
      <Row form>
        <Col md={6}>
          <FormGroup>
            <Label>Patient:</Label>
            <Select
              options={selectPatientList}
              onChange={handleChangePatient}
              isDisabled={currentDay !== MIN_DAY}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Date of Receipt:</Label>
            <Input
              type="date"
              placeholder="date of receipt..."
              onChange={e => setDateReceipt(e.target.value)}
              required
            />
          </FormGroup>
        </Col>
      </Row>
      <Row form>
        <Col md={6}>
          <FormGroup>
            <Label>Office address:</Label>
            <Select
              options={officeAddressList}
              onChange={e => setOfficeAddress(e.value)}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Doctor:</Label>
            <Select options={doctorList} onChange={e => setDoctor(e.value)} />
          </FormGroup>
        </Col>
      </Row>
      <Row form>
        <Col md={6}>
          <FormGroup>
            <SelectDiagnoses
              changeDiagnoses={handleDiagnosesChange}
              patient={
                idPatient && {
                  id: idPatient,
                  diagnoses: patients[idPatient].diagnoses,
                }
              }
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <SelectServices
              updateServices={updatePatient}
              onChange={handleServicesChange}
              patient={
                idPatient && {
                  id: idPatient,
                  services: patients[idPatient].services,
                }
              }
            />
          </FormGroup>
        </Col>
      </Row>
      <Button color="secondary" size="lg">
        Submit
      </Button>
    </Form>
  )
}

T.PropTypes = {
  showMesseageSuccess: T.func.isRequired,
  updatePatient: T.func.isRequired,
  patients: T.Object,
}

export { DoctorsAppointment }
