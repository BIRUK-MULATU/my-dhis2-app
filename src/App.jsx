import React, { useState } from 'react'
import { useDataMutation } from '@dhis2/app-runtime'
import {
    Button,
    InputField,
    SingleSelect,
    SingleSelectOption,
    DataTable,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    TableHead,
    TableBody,
    NoticeBox
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { v4 as uuidv4 } from 'uuid' // for unique keys

// DHIS2 Data Store mutation
const createAttendantMutation = {
    resource: ({ key }) => `dataStore/trainingAttendants/${key}`,
    type: 'create',
    data: ({ attendant }) => attendant,
}

const MyApp = () => {
    const [attendant, setAttendant] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        organizationUnit: '',
        trainingDate: '',
    })
    const [attendants, setAttendants] = useState([])
    const [mutate, { loading, error }] = useDataMutation(createAttendantMutation)

    const handleChange = (field, value) => {
        setAttendant({ ...attendant, [field]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const key = uuidv4() // unique key for each record
            await mutate({ attendant, key }) // submit to DHIS2
            setAttendants([...attendants, attendant]) // add to local table
            setAttendant({
                firstName: '',
                lastName: '',
                age: '',
                gender: '',
                organizationUnit: '',
                trainingDate: '',
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className={classes.container}>
            <h1>{i18n.t('Training Attendant Registration Form')}</h1>

            {error && (
                <NoticeBox error title="Error submitting form">
                    {error.message}
                </NoticeBox>
            )}

            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <div className={classes.formRow}>
                    <InputField
                        label="First Name"
                        value={attendant.firstName}
                        onChange={(e) => handleChange('firstName', e.value)}
                        required
                    />
                    <InputField
                        label="Last Name"
                        value={attendant.lastName}
                        onChange={(e) => handleChange('lastName', e.value)}
                        required
                    />
                    <InputField
                        label="Age"
                        type="number"
                        value={attendant.age}
                        onChange={(e) => handleChange('age', e.value)}
                        required
                    />
                    <SingleSelect
                        label="Gender"
                        selected={attendant.gender}
                        onChange={(e) => handleChange('gender', e.selected)}
                    >
                        <SingleSelectOption label="Select Gender" value="" />
                        <SingleSelectOption label="Male" value="Male" />
                        <SingleSelectOption label="Female" value="Female" />
                        <SingleSelectOption label="Other" value="Other" />
                    </SingleSelect>
                    <InputField
                        label="Organization Unit"
                        value={attendant.organizationUnit}
                        onChange={(e) => handleChange('organizationUnit', e.value)}
                        required
                    />
                    <InputField
                        label="Training Date"
                        type="date"
                        value={attendant.trainingDate}
                        onChange={(e) => handleChange('trainingDate', e.value)}
                        required
                    />
                </div>

                <Button type="submit" primary disabled={loading}>
                    {loading ? 'Submitting...' : 'Register Attendant'}
                </Button>
            </form>

            {attendants.length > 0 && (
                <DataTable scrollHeight="300px">
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader />
                            <DataTableColumnHeader>First Name</DataTableColumnHeader>
                            <DataTableColumnHeader>Last Name</DataTableColumnHeader>
                            <DataTableColumnHeader>Age</DataTableColumnHeader>
                            <DataTableColumnHeader>Gender</DataTableColumnHeader>
                            <DataTableColumnHeader>Organization Unit</DataTableColumnHeader>
                            <DataTableColumnHeader>Training Date</DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>
                    <TableBody>
                        {attendants.map((a, index) => (
                            <DataTableRow
                                key={index}
                                expandableContent={
                                    <div style={{ backgroundColor: 'lightblue', margin: 8, padding: 4 }}>
                                        {a.firstName} {a.lastName}, {a.age} years old, {a.gender}, from {a.organizationUnit}, training on {a.trainingDate}
                                    </div>
                                }
                                onExpandToggle={() => {}}
                            >
                                <DataTableCell />
                                <DataTableCell>{a.firstName}</DataTableCell>
                                <DataTableCell>{a.lastName}</DataTableCell>
                                <DataTableCell>{a.age}</DataTableCell>
                                <DataTableCell>{a.gender}</DataTableCell>
                                <DataTableCell>{a.organizationUnit}</DataTableCell>
                                <DataTableCell>{a.trainingDate}</DataTableCell>
                            </DataTableRow>
                        ))}
                    </TableBody>
                </DataTable>
            )}
        </div>
    )
}

export default MyApp
