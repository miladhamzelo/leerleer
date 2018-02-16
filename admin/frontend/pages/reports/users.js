import React, { Component } from 'react'
import { branch } from 'baobab-react/higher-order'
import PropTypes from 'baobab-react/prop-types'
import api from '~base/api'

import Page from '~base/page'
import {loggedIn} from '~base/middlewares/'

import { BaseTable } from '~base/components/base-table'
import Checkbox from '~base/components/base-checkbox'
import Editable from '~base/components/base-editable'

class Reports extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sortAscending: true,
      sort: 'screenName',
      sortable: true,
      filters: {},
      stats: {
        leads: {
          total: 0,
          partial: 0,
          untouched: 0,
          touched: 0,
          contacted: 0,
          uncontacted: 0,
          affiliated: 0,
          appointments: 0,
          days: []
        }
      },
      selectedAll: false,
      selectedCheckboxes: new Set()
    }

    this.handleOnFilter = this.handleOnFilter.bind(this)
  }

  componentWillMount () {
    this.context.tree.set('users', {
      page: 1,
      totalItems: 0,
      items: [],
      pageLength: 10
    })
    this.context.tree.commit()
    this.loadOrgs()
  }

  async loadOrgs (sort = this.state.sort) {
    const url = '/admin/users/'
    const params = {
      start: 0,
      limit: 0
    }

    if (this.state.sortable) {
      params.sort = (this.state.sortAscending ? '' : '-') + sort
    }

    const body = await api.get(
      url,
      {
        ...params
      }
    )

    this.setState({
      ...this.state,
      reports: body.data.map(function (item) {
        item.count = parseInt(Math.random() * (40 - 1) + 1)
        return item
      })
    })
  }

  getColumns () {
    return [
      {
        'title': 'Screen name',
        'property': 'screenName',
        'default': 'N/A',
        'sortable': true,
        'totals': false
      },
      {
        'title': 'Name',
        'property': 'name',
        'default': 'N/A',
        'sortable': true,
        'totals': false
      },
      {
        'title': 'Email',
        'property': 'email',
        'default': 'N/A',
        'sortable': true,
        'totals': false
      },
      {
        'title': 'Counts',
        'property': 'count',
        'default': 'N/A',
        'sortable': false,
        'totals': true
      },
      {
        'title': 'Editable',
        'default': 0,
        'type': 'number',
        formatter: (row) => {
          return (
            <Editable
              value={row.count}
              handleChange={this.changeCount}
              type='number'
              obj={row}
              width={80}
            />
          )
        }
      },
      {
        'title': 'Seleccionar Todo',
        'abbreviate': true,
        'abbr': (() => {
          return (
            <Checkbox
              label='checkAll'
              handleCheckboxChange={(e) => this.checkAll(!this.state.selectedAll)}
              key='checkAll'
              checked={this.state.selectedAll}
              hideLabel />
          )
        })(),
        'property': 'checkbox',
        'default': '',
        formatter: (row) => {
          if (!row.selected) {
            row.selected = false
          }
          return (
            <Checkbox
              label={row}
              handleCheckboxChange={this.toggleCheckbox}
              key={row}
              checked={row.selected}
              hideLabel />
          )
        }
      },
    ]
  }

  handleSort (sort) {
    let sortAscending = sort !== this.state.sort ? false : !this.state.sortAscending
    this.setState({sort, sortAscending}, function () {
      this.loadOrgs()
    })
  }

  handleOnFilter (filters) {
    this.setState({filters})
  }

  showModal () {
    this.setState({
      className: ' is-active'
    })
  }

  checkAll = (check) => {
    for (let row of this.state.reports) {
      this.toggleCheckbox(row, check)
    }
    this.setState({ selectedAll: check })
  }

  toggleCheckbox = (row, all) => {
    if (this.state.selectedCheckboxes.has(row) && !all) {
      this.state.selectedCheckboxes.delete(row)
      row.selected = false
    }
    else {
      this.state.selectedCheckboxes.add(row)
      row.selected = true
    }
    console.log('Selected: ' + row.screenName)
    console.log('Total: ' + this.state.selectedCheckboxes.size)
  }

  changeCount = async (value, row) => {
    row.count = value
    return value
  }

  render () {
    return (
      <div className='columns c-flex-1 is-marginless'>
        <div className='column is-paddingless'>
          <div className='section is-paddingless-top'>
            <h1
              className='is-size-3 is-padding-top-small is-padding-bottom-small'
            >
              Reportes
            </h1>
            <div className='card'>
              <div className='card-content is-paddingless'>
                <BaseTable
                  handleSort={(e) => this.handleSort(e)}
                  data={this.state.reports}
                  className='table is-striped is-fullwidth has-text-centered is-marginless'
                  columns={this.getColumns()}
                  sortAscending={this.state.sortAscending}
                  sortBy={this.state.sort}
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Reports.contextTypes = {
  tree: PropTypes.baobab
}

const branchedReports = branch({users: 'users'}, Reports)

export default Page({
  path: '/reports/users',
  title: 'User reports',
  icon: 'users',
  exact: true,
  validate: loggedIn,
  component: branchedReports
})
