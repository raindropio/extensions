import React from 'react'
import t from 't'
import Select from 'react-select/lib/Creatable'
import filtersStore from '../../../stores/filters'

const selectStyles = {
    control: (styles, { isFocused })=>({
        ...styles, 
        border: 0,
        minHeight: '29px',
        boxShadow: isFocused ? 'inset 0 0 0 1px var(--accentColor, #4a90e2), 0 0 0 var(--thin-border, 1px) var(--accentColor, #4a90e2)' : 'inset 0 0 0 var(--thin-border, 1px) var(--thin-border-color-plus, rgba(0,0,0,.15))'
    }),
    dropdownIndicator: ()=>({ display: 'none' }),
    multiValue: (styles)=>({ ...styles, backgroundColor: 'var(--accentColor, #4a90e2)', fontSize: '15px' }),
    multiValueLabel: (styles)=>({ ...styles, color: 'white' }),
    multiValueRemove: (styles)=>({ ...styles, color: 'white', ':hover': { backgroundColor: 'rgba(0,0,0,.25)' } }),
    valueContainer: (styles)=>({ ...styles, padding: '2px 3px' }),
    indicatorSeparator: ()=>({ display: 'none' })
}

export default class Tags extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            selected: [],
            available: []
        }
    }

    componentDidMount() {
        filtersStore.onLoad()
        this.unsubscribeFilters = filtersStore.listen(this.onAvailableChange)

        this.onTagsChange()
        this.onAvailableChange()
    }

    componentWillUnmount() {
        this.unsubscribeFilters();
    }

    componentDidUpdate(prevProps) {
        if (this.props.suggestedTags != prevProps.suggestedTags)
            this.onAvailableChange()

        if (this.props.tags != prevProps.tags)
            this.onTagsChange()
    }

    onTagsChange=()=>{
        this.setState({
            selected: this.props.tags.map(( label )=>({ label, value: label }))
        })
    }

    onAvailableChange=()=>{
        this.setState({
            available: [
                { label: t.s('my'), options: filtersStore.getTags(0).map(({_id, count})=>({ label: _id, value: _id })) },
                { label: t.s('suggested'), options: this.props.suggestedTags.map(( label )=>({ label, value: label })) }
            ]
        })
    }

    onSelectChange = (selected)=>{
        this.setState({ selected })
        this.props.onChange({tags: selected.map(({value})=>value) }, ()=>{}, {trigger: false})
    }

    formatCreateLabel = (input)=>`+${input}`
    noOptionsMessage = ()=><div>{t.s('noTags')}</div>

	render() {
        return (
            <section className="tags">
                <Select
                    isMulti
                    value={this.state.selected}
                    options={this.state.available}
                    menuPlacement='top'
                    placeholder={t.s("addTag")+"…"}
                    closeMenuOnSelect={false}
                    isClearable={false}
                    openMenuOnFocus
                    tabIndex='10'
                    tabSelectsValue={false}
                    formatCreateLabel={this.formatCreateLabel}
                    noOptionsMessage={this.noOptionsMessage}
                    onChange={this.onSelectChange}
                    styles={selectStyles} />
            </section>
        )
    }
}