/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var q = require("q");
var React = require('react');
var classNames = require('classnames');
var MatrixClientPeg = require('matrix-react-sdk/lib/MatrixClientPeg');

module.exports = React.createClass({
    displayName: 'NotificationStateContextMenu',

    propTypes: {
        room: React.PropTypes.object.isRequired,
        /* callback called when the menu is dismissed */
        onFinished: React.PropTypes.func,
    },

    getInitialState: function() {
        var areNotifsMuted = false;
        var cli = MatrixClientPeg.get();
        if (!cli.isGuest()) {
            var roomPushRule = cli.getRoomPushRule("global", this.props.room.roomId);
            if (roomPushRule) {
                if (0 <= roomPushRule.actions.indexOf("dont_notify")) {
                    areNotifsMuted = true;
                }
            }
        }

        return {
            areNotifsMuted: areNotifsMuted,
        };
    },

    _save: function( isMuted ) {
        const roomId = this.props.room.roomId;
        /*
        if (this.state.areNotifsMuted !== originalState.areNotifsMuted) {
            promises.push(MatrixClientPeg.get().setRoomMutePushRule(
                "global", roomId, this.state.areNotifsMuted
            ));
        }
        */
        var cli = MatrixClientPeg.get();
        this.setState({areNotifsMuted: isMuted});
        if (!cli.isGuest()) {
            cli.setRoomMutePushRule(
                "global", roomId, isMuted
            );
        }
    },

    _onToggle: function(ev) {
        switch (ev.target.value) {
            case "all":
                this._save(false);
                break;
            case "mute":
                this._save(true);
                break;
        }

        if (this.props.onFinished) {
            this.props.onFinished();
        };
    },

    _onClickAllNotifs: function() {
        this._save(false);
        if (this.props.onFinished) {
            this.props.onFinished();
        };
    },

    _onClickMute: function() {
        this._save(true);
        if (this.props.onFinished) {
            this.props.onFinished();
        };
    },

    render: function() {
        var cli = MatrixClientPeg.get();

        var allNotifsClasses = classNames({
            'mx_ContextualMenu_field': true,
            'mx_ContextualMenu_fieldSet': !this.state.areNotifsMuted,
        });

        var muteNotifsClasses = classNames({
            'mx_ContextualMenu_field': true,
            'mx_ContextualMenu_fieldSet': this.state.areNotifsMuted,
        });

        return (
            <div>
                <div className={ allNotifsClasses } onClick={this._onClickAllNotifs} >
                    { !this.state.areNotifsMuted ? "ON" : "OFF" }
                    <img src="img/icon-context-mute-off.svg" width="15" height="10" />
                    All notifications
                </div>
                <div className={ muteNotifsClasses } onClick={this._onClickMute} >
                    { this.state.areNotifsMuted ? "ON" : "OFF" }
                    <img src="img/icon-context-mute.svg" width="15" height="10" />
                    Mute
                </div>
            </div>
        );
    }
});