'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('../../utils/_');

var SystemStateMixin = require('../../mixins/SystemStateMixin');

var Sidebar = require('./shared/Sidebar');
var ApprovalStatusFilter = require('./shared/ApprovalStatusFilter');
var EnabledFilter = require('./shared/EnabledFilter');
var ListingTile = require('../listing/ListingTile');
var LoadMore = require('../shared/LoadMore');

var PaginatedListingsStore = require('../../stores/PaginatedListingsStore');

var ListingActions = require('../../actions/ListingActions');
var { UserRole } = require('../../constants');


var OrgListings = React.createClass({

    mixins: [
        SystemStateMixin,
        Reflux.listenTo(PaginatedListingsStore, 'onStoreChanged'),
        Reflux.listenTo(ListingActions.listingChangeCompleted, 'onListingChangeCompleted')
    ],

    getInitialState: function () {
        return {
            counts: {},
            listings: [],
            hasMore: false,
            filter: {
                approvalStatus: null,
                org: this.props.org.params.org,
                enabled: null
            }
        };
    },

    getPaginatedList: function () {
        return PaginatedListingsStore.getListingsByFilter(this.state.filter);
    },

    fetchAllListingsIfEmpty: function () {
        var listings = this.getPaginatedList();
        if (!listings) {
            ListingActions.fetchAllListings(this.state.filter);
        }
        else {
            this.onStoreChanged();
        }
    },

    onLoadMore: function () {
        ListingActions.fetchAllListings(this.state.filter);
    },

    onFilterChanged: function (key, value) {
        this.state.filter[key] = value;
        this.fetchAllListingsIfEmpty();
        this.forceUpdate();
        this.onStoreChanged();
    },

    onStoreChanged: function () {
        var paginatedList = this.getPaginatedList();
        if (!paginatedList) {
            return;
        }
        var { data, hasMore, counts } = paginatedList;

        this.setState({
            listings: data,
            hasMore: hasMore,
            counts: counts
        });
    },

    onListingChangeCompleted: function () {
        ListingActions.fetchAllListings(this.state.filter);
    },

    componentWillReceiveProps: function(nextProps) {
        if (this.props.org.name !== nextProps.org.name) {
            this.onFilterChanged('org', nextProps.org.params.org);
        }
    },

    componentDidMount: function () {
        this.fetchAllListingsIfEmpty();
    },

    render: function () {
        var sidebarFilterOptions = {
            value: this.state.filter,
            counts: this.state.counts,
            onFilterChanged: this.onFilterChanged,
            organizations: this.state.system.organizations || []
        };
        /* jshint ignore:start */
        return this.transferPropsTo(
            <div className="AllListings row">
                <aside className="AllListings__sidebar col-md-2">
                    <Sidebar>
                        <ApprovalStatusFilter role={ UserRole.ORG_STEWARD } { ...sidebarFilterOptions } />
                        <EnabledFilter { ...sidebarFilterOptions } />
                    </Sidebar>
                </aside>
                <LoadMore className="AllListings__listings col-md-10 all" hasMore={this.state.hasMore} onLoadMore={this.onLoadMore}>
                    { ListingTile.fromArray(this.state.listings, UserRole.ORG_STEWARD) }
                </LoadMore>
            </div>
    );
    /* jshint ignore:end */
}

});

module.exports = OrgListings;
