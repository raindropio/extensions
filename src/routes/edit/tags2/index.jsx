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
    indicatorSeparator: ()=>({ display: 'none' }),
    option: (styles, { isSelected, isFocused })=>({
        ...styles,
        backgroundColor: isSelected ? 'var(--accentColor, #4a90e2)' : isFocused ? 'rgba(0,0,0,.1)' : 'transparent',
        padding: '4px 12px'
    }),
    input: (styles)=>({ ...styles, fontSize: '14px' }),
    placeholder: (styles)=>({ ...styles, fontSize: '14px' })
}

export default class Tags extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            autoFocus: localStorage.getItem('autoFocus') == 'tags',
            menuOpen: false,
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
                { label: t.s('suggested'), options: this.props.suggestedTags.map(( label )=>({ label, value: label })) },
                { label: t.s('all'), options: filtersStore.getTags(0).map(({_id, count})=>({ label: _id, value: _id })) }
            ]
        })
    }

    onSelectChange = (selected)=>{
        this.setState({ selected })
        this.props.onChange({tags: selected.map(({value})=>value) }, ()=>{}, {trigger: false})
    }

    onKeyDown = ({ key })=>{
        if (key === 'Enter' && !this.state.menuOpen){
            this.props.onSubmit()
        }
    }

    onMenuOpen = ()=>this.setState({menuOpen: true})
    
    onMenuClose = ()=>this.setState({menuOpen: false})

    onFocus = ()=>localStorage.setItem('autoFocus', 'tags')

    formatCreateLabel = (input)=>`+${input}`
    noOptionsMessage = ()=><div>{t.s('noTags')}</div>

	render() {
        return (
            <section className="tags" data-open={this.state.menuOpen}>
                <Select
                    isMulti
                    value={this.state.selected}
                    options={this.state.available}
                    menuPlacement='bottom'
                    placeholder={t.s("addTag")+"…"}
                    closeMenuOnSelect={true}
                    isClearable={false}
                    openMenuOnFocus={false}
                    autoFocus={this.state.autoFocus}
                    tabIndex='4'
                    tabSelectsValue={false}
                    formatCreateLabel={this.formatCreateLabel}
                    noOptionsMessage={this.noOptionsMessage}
                    onChange={this.onSelectChange}
                    onKeyDown={this.onKeyDown}
                    onMenuOpen={this.onMenuOpen}
                    onMenuClose={this.onMenuClose}
                    onFocus={this.onFocus}
                    styles={selectStyles} />
            </section>
        )
    }
}