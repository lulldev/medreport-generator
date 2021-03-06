import docxtemplater from 'docxtemplater'
import DocxMerger from 'docx-merger'
import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'
import moment from 'moment'

import { saveAs } from 'file-saver'

import {
  DATE_FORMAT,
  CODE_97110,
  CODE_97530,
  CODE_97140,
  CODE_98940,
  CODE_98941,
  CODE_98942,
  CODE_99202,
  CODE_99203,
  CODE_99212,
  CODE_99213,
} from '../constants/api'

const newLineMapping = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
}

export const generateFile = (pages, patient) => {
  const listPages = [...pages]
  const result = []

  loadFile(process.env.REACT_APP_URL_DOCX, (error, content) => {
    if (error) {
      throw error
    }

    listPages.forEach(page => {
      let servicesMain = page.services.filter((element, index) => index <= 5)
      let insertData = {
        ...patient,
        hasGen: patient.gender === 'female',
        hasG: patient.gender !== 'female',
        hasH: patient.genderHolder === 'female',
        hasEmp: !patient.isEmployment,
        hasEmpp: patient.isEmployment,
        hasOth: !patient.isOtherAccident,
        hasAu: patient.isAutoAccident,
        hasA: !patient.isAutoAccident,
        dobPatient: moment(patient.dobPatient).format('MMDDYYYY'),
        dobHolder: moment(patient.dobHolder).format('MMDDYYYY'),
        accidentDate: moment(patient.accidentDate).format('MM DD YYYY'),
        policyNumber: patient.policyNumber,
        services: getServicesTemplate(servicesMain),
        remain: getRemainDiagnoses(page.diagnoses),
        ...getDiagnosesList(page.diagnoses),
        ...getDoctorFormat(page.doctor),
        sum_: calculateSum(servicesMain),
        dv: moment(Date().now).format('MMDDYYYY'),
        hasSela: patient.relastionship === 'Selа',
        hasSpouse: patient.relastionship === 'Spouse',
        hasChild: patient.relastionship === 'Child',
        hasOther: patient.relastionship === 'Other',
        ...getOfficeFormat(page.officeAddress),
      }

      if (page.services.length <= 6) {
        insertData['nl'] = generateEmptyLine(page.services.length)
      }

      result.push(renderData(content, insertData))

      if (page.services.length > 6) {
        const servicesRemain = page.services.filter(
          (element, index) => index > 5
        )
        insertData['nl'] = generateEmptyLine(servicesRemain.length)
        insertData['services'] = getServicesTemplate(servicesRemain)
        insertData['sum_'] = calculateSum(servicesRemain)
        result.push(renderData(content, insertData))
      }
    })

    var docx = new DocxMerger({}, result)
    const dateTimeCreate = moment(Date.now()).format(DATE_FORMAT)
    const outputName = `report_${dateTimeCreate}.docx`
    docx.save('blob', function(data) {
      saveAs(data, outputName)
    })
  })
}

const loadFile = (url, callback) => {
  JSZipUtils.getBinaryContent(url, callback)
}

const renderData = (content, data) => {
  let zip = new JSZip(content)
  let doc = new docxtemplater().loadZip(zip)

  doc.setOptions({
    nullGetter: () => {
      return ''
    },
  })

  doc.setData(data)

  try {
    doc.render()
  } catch (error) {
    throw error
  }

  return doc.getZip().generate({ type: 'arraybuffer' })
}

const generateEmptyLine = countLines => {
  const result = []
  let countLine = 6 - countLines
  for (let j = 0; j < newLineMapping[countLine]; j++) {
    result.push({})
  }
  return result
}

const calculateSum = services => {
  let sum = 0.0
  services.forEach(element => {
    sum += parseFloat(element.priceView)
  })
  return sum.toFixed(2)
}

const getRemainDiagnoses = diagnoses => {
  const remain = diagnoses.slice(12, diagnoses.length)
  const result = []
  remain.forEach(element => {
    result.push(element.label)
  })
  return result.join()
}

const getDiagnosesList = diagnoses => {
  const result = {}
  diagnoses.slice(0, 12).forEach((element, indexElement) => {
    result[`dai_${indexElement}`] = element.value
  })
  return result
}

const getDoctorFormat = doctor => {
  return {
    [`dN_`]: doctor.name,
    [`npi_`]: doctor.npi,
    [`sig_`]: doctor.signature,
  }
}

const getServicesTemplate = services => {
  const result = [...services]
  result.forEach((element, number) => {
    if (
      element.label === CODE_97110 &&
      result.find(elem => elem.label === CODE_97530) !== undefined
    ) {
      element.pfx = '59'
    } else if (
      element.label === CODE_97140 &&
      result.find(
        elem =>
          elem.label === CODE_98940 ||
          elem.label === CODE_98941 ||
          elem.label === CODE_98942
      ) !== undefined
    ) {
      element.pfx = '59'
    } else if (
      (element.label === CODE_99202 ||
        element.label === CODE_99203 ||
        element.label === CODE_99212 ||
        element.label === CODE_99213) &&
      result.length > 1
    ) {
      element.pfx = '25'
    }
    let quantity = element.quantity === '1/2' ? 0.5 : element.quantity
    element.priceView = (parseFloat(element.price) * quantity).toFixed(2)
  })

  return result
}

const getOfficeFormat = office => {
  const indexSub = office.search(/JACKSONVILLE/i)
  return {
    of_1: office.substr(0, indexSub),
    of_2: office.substr(indexSub),
  }
}
