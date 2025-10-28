import React, { useState, useEffect } from 'react'
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
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
    NoticeBox,
} from '@dhis2/ui'

// ✅ Mutation to save attendant to DHIS2 dataStore
const createAttendantMutation = {
    resource: 'dataStore/trainingAttendants',
    type: 'update',
    id: ({ id }) => id,
    data: ({ data }) => data,
}

// ✅ Query to generate DHIS2 ID
const generateIdQuery = {
    id: {
        resource: 'system/id',
        params: { limit: 1 },
    },
}

export default function App() {
    const [attendants, setAttendants] = useState([])
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        organizationUnit: '',
        trainingDate: '',
    })

    const [mutate, { error, loading }] = useDataMutation(createAttendantMutation)
    const { refetch: generateId } = useDataQuery(generateIdQuery, { lazy: true })

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('attendants')) || []
        setAttendants(stored)
    }, [])

    const handleChange = ({ name, value }) => {
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()

        try {
            // ✅ Get DHIS2-generated ID
            const { id } = await generateId()
            const newId = id.codes[0]

            const newAttendant = { ...form, id: newId }

            await mutate({ id: newId, data: newAttendant })

            const updated = [...attendants, newAttendant]
            setAttendants(updated)
            localStorage.setItem('attendants', JSON.stringify(updated))

            setForm({
                firstName: '',
                lastName: '',
                age: '',
                gender: '',
                organizationUnit: '',
                trainingDate: '',
            })
            console.log('✅ Successfully submitted with DHIS2 ID:', newAttendant)
        } catch (err) {
            console.error('❌ Error submitting attendant:', err)
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Training Attendant Registration Form</h2>

            {error && (
                <NoticeBox error title="Error submitting form">
                    {error.message}
                </NoticeBox>
            )}

            <form onSubmit={handleSubmit}>
                <InputField name="firstName" label="First Name" value={form.firstName} onChange={handleChange} required />
                <InputField name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} required />
                <InputField name="age" label="Age" type="number" value={form.age} onChange={handleChange} />
                <SingleSelect
                    name="gender"
                    label="Gender"
                    selected={form.gender}
                    onChange={({ selected }) => handleChange({ name: 'gender', value: selected })}
                >
                    <SingleSelectOption label="Male" value="Male" />
                    <SingleSelectOption label="Female" value="Female" />
                </SingleSelect>
                <InputField
                    name="organizationUnit"
                    label="Organization Unit"
                    value={form.organizationUnit}
                    onChange={handleChange}
                />
                <InputField
                    name="trainingDate"
                    label="Training Date"
                    type="date"
                    value={form.trainingDate}
                    onChange={handleChange}
                />

                <Button type="submit" primary disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </form>

            <h3 style={{ marginTop: 30 }}>Registered Attendants</h3>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>First Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Last Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Age</DataTableColumnHeader>
                        <DataTableColumnHeader>Gender</DataTableColumnHeader>
                        <DataTableColumnHeader>Organization Unit</DataTableColumnHeader>
                        <DataTableColumnHeader>Training Date</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>
                <TableBody>
                    {attendants.map(a => (
                        <DataTableRow key={a.id}>
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
        </div>
    )
}
