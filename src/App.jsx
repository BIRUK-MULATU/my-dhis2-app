import React, { useState, useEffect } from 'react'
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

// DHIS2 DataStore mutation as a function
const createAttendantMutation = (key, attendant) => ({
    resource: `dataStore/trainingAttendants/${key}`,
    type: 'create',
    data: attendant,
})

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

    // Load attendants from localStorage on mount
    useEffect(() => {
        const data = localStorage.getItem('attendants')
        if (data) setAttendants(JSON.parse(data))
    }, [])

    // Save attendants to localStorage
    const saveAttendantsToJson = (attendantsArray) => {
        localStorage.setItem('attendants', JSON.stringify(attendantsArray))
    }

    const handleChange = (field, value) => {
        setAttendant({ ...attendant, [field]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            // Generate unique ID and short code
            const key = uuidv4()
            const code = key.slice(0, 8).toUpperCase()
            const newAttendant = { ...attendant, code }

            // Submit to DHIS2 DataStore
            await mutate(createAttendantMutation(key, newAttendant))

            // Update local state and localStorage
            const updatedAttendants = [...attendants, newAttendant]
            setAttendants(updatedAttendants)
            saveAttendantsToJson(updatedAttendants)

            // Reset form
            setAttendant({
                firstName: '',
                lastName: '',
                age: '',
                gender: '',
                organizationUnit: '',
                trainingDate: '',
            })

            console.log('Attendant added:', newAttendant)
        } catch (err) {
            console.error('Error submitting attendant:', err)
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
                            <DataTableColumnHeader>Code</DataTableColumnHeader>
                            <DataTableColumnHeader>First Name</DataTableColumnHeader>
                            <DataTableColumnHeader>Last Name</DataTableColumnHeader>
                            <DataTableColumnHeader>Age</DataTableColumnHeader>
                            <DataTableColumnHeader>Gender</DataTableColumnHeader>
                            <DataTableColumnHeader>Organization Unit</DataTableColumnHeader>
                            <DataTableColumnHeader>Training Date</DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>
                    <TableBody>
                        {attendants.map((a) => (
                            <DataTableRow
                                key={a.code}
                                expandableContent={
                                    <div style={{ backgroundColor: 'lightblue', margin: 8, padding: 4 }}>
                                        {a.code} - {a.firstName} {a.lastName}, {a.age} years old, {a.gender}, from {a.organizationUnit}, training on {a.trainingDate}
                                    </div>
                                }
                                onExpandToggle={() => {}}
                            >
                                <DataTableCell>{a.code}</DataTableCell>
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
