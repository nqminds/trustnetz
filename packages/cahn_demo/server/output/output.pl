% preamble - loading persistency module and code to attach database
:- module(db,
[
  attach_db/1 % +File  - attach's database file
]
).

% import persistency module
:- use_module(library(persistency)).

% define predicate rule to attach database file used to store persisted facts (data)
attach_db(File) :-
db_attach(File, []).

validate_required(Var, FieldName) :-
    (var(Var) ->
        format(atom(Msg), 'Missing required field "~w"', [FieldName]),
        throw(error(Msg))
    ; true
    ).

validate_type_number(Var, ValidVar, FieldName) :-
    ( nonvar(Var) ->
        ( number(Var) ->
            ValidVar = Var
        ; format(atom(Msg), 'Invalid type for ~w: "~w"', [FieldName, Var]),
          throw(error(Msg))
        )
    ; ValidVar = _
    ).

validate_type_integer(Var, ValidVar, FieldName) :-
    ( nonvar(Var) ->
        ( integer(Var) ->
            ValidVar = Var
        ; format(atom(Msg), 'Invalid type for ~w: "~w"', [FieldName, Var]),
          throw(error(Msg))
        )
    ; ValidVar = _
    ).

validate_type_string(Var, ValidVar, FieldName) :-
    ( nonvar(Var) ->
        ( string(Var) ->
            ValidVar = Var
        ; format(atom(Msg), 'Invalid type for ~w: "~w"', [FieldName, Var]),
          throw(error(Msg))
        )
    ; ValidVar = _
    ).

validate_type_boolean(Var, ValidVar, FieldName) :-
    ( nonvar(Var) ->
        ( atom(Var) ->
            ( Var == true ->
                ValidVar = true
            ; Var == false ->
                ValidVar = false
            ; format(atom(Msg), 'Invalid value for ~w: "~w" (must be "true" or "false")', [FieldName, Var]),
              throw(error(Msg))
            )
        ; format(atom(Msg), 'Invalid type for ~w: "~w" (must be a string)', [FieldName, Var]),
          throw(error(Msg))
        )
    ; ValidVar = _
    ).


% type definitions and get, add, remove function definitions generated from schema claims

:- persistent
  db:device_type_trust(_AuthoriserId, _CreatedAt, _DeviceTypeId).

get_device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId) :-
  with_mutex(db, device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId)).

get_all_device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId, Matches) :- 
 with_mutex(db, 
    findall(device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId),
            device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId),
            Matches)
).

add_device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId) :-
  % Validate required fields
  validate_required(DeviceTypeId, "DeviceTypeId"),
  validate_required(AuthoriserId, "AuthoriserId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert AuthoriserId
  validate_type_string(AuthoriserId, ValidAuthoriserId, "AuthoriserId"),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert DeviceTypeId
  validate_type_string(DeviceTypeId, ValidDeviceTypeId, "DeviceTypeId"),
  assert_device_type_trust(ValidAuthoriserId, ValidCreatedAt, ValidDeviceTypeId).

remove_device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId) :-
  device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId),
  with_mutex(db, (
    retractall_device_type_trust(AuthoriserId, CreatedAt, DeviceTypeId)
  )).

:- persistent
  db:sbom_vulnerability(_CreatedAt, _SbomId, _VulnerabilityScore).

get_sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore) :-
  with_mutex(db, sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore)).

get_all_sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore, Matches) :- 
 with_mutex(db, 
    findall(sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore),
            sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore),
            Matches)
).

add_sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore) :-
  % Validate required fields
  validate_required(SbomId, "SbomId"),
  validate_required(VulnerabilityScore, "VulnerabilityScore"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert SbomId
  validate_type_string(SbomId, ValidSbomId, "SbomId"),
  % Validate and assert VulnerabilityScore
  validate_type_number(VulnerabilityScore, ValidVulnerabilityScore, "VulnerabilityScore"),
  assert_sbom_vulnerability(ValidCreatedAt, ValidSbomId, ValidVulnerabilityScore).

remove_sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore) :-
  sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore),
  with_mutex(db, (
    retractall_sbom_vulnerability(CreatedAt, SbomId, VulnerabilityScore)
  )).

:- persistent
  db:user(_CanIssueDeviceTrust, _CanIssueManufacturerTrust, _CreatedAt, _Id, _Username).

get_user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username) :-
  with_mutex(db, user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username)).

get_all_user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username, Matches) :- 
 with_mutex(db, 
    findall(user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username),
            user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username),
            Matches)
).

add_user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username) :-
  % Validate required fields
  validate_required(Id, "Id"),
  validate_required(Username, "Username"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  (user(_,_,_,Id,_) ->
    format(atom(Msg), 'found existing user with Id "~w"', [Id]),
    !,
    throw(error(Msg))
  ; true),
  (user(_,_,_,_,Username) ->
    format(atom(Msg), 'found existing user with Username "~w"', [Username]),
    !,
    throw(error(Msg))
  ; true),
  % Validate and assert CanIssueDeviceTrust
  validate_type_boolean(CanIssueDeviceTrust, ValidCanIssueDeviceTrust, "CanIssueDeviceTrust"),
  % Validate and assert CanIssueManufacturerTrust
  validate_type_boolean(CanIssueManufacturerTrust, ValidCanIssueManufacturerTrust, "CanIssueManufacturerTrust"),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert Id
  validate_type_string(Id, ValidId, "Id"),
  % Validate and assert Username
  validate_type_string(Username, ValidUsername, "Username"),
  assert_user(ValidCanIssueDeviceTrust, ValidCanIssueManufacturerTrust, ValidCreatedAt, ValidId, ValidUsername).

remove_user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username) :-
  user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username),
  with_mutex(db, (
    retractall_user(CanIssueDeviceTrust, CanIssueManufacturerTrust, CreatedAt, Id, Username)
  )).

:- persistent
  db:device(_CreatedAt, _Id, _Idevid, _Name).

get_device(CreatedAt, Id, Idevid, Name) :-
  with_mutex(db, device(CreatedAt, Id, Idevid, Name)).

get_all_device(CreatedAt, Id, Idevid, Name, Matches) :- 
 with_mutex(db, 
    findall(device(CreatedAt, Id, Idevid, Name),
            device(CreatedAt, Id, Idevid, Name),
            Matches)
).

add_device(CreatedAt, Id, Idevid, Name) :-
  % Validate required fields
  validate_required(Id, "Id"),
  validate_required(Name, "Name"),
  validate_required(Idevid, "Idevid"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  (device(_,Id,_,_) ->
    format(atom(Msg), 'found existing device with Id "~w"', [Id]),
    !,
    throw(error(Msg))
  ; true),
  (device(_,_,_,Name) ->
    format(atom(Msg), 'found existing device with Name "~w"', [Name]),
    !,
    throw(error(Msg))
  ; true),
  (device(_,_,Idevid,_) ->
    format(atom(Msg), 'found existing device with Idevid "~w"', [Idevid]),
    !,
    throw(error(Msg))
  ; true),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert Id
  validate_type_string(Id, ValidId, "Id"),
  % Validate and assert Idevid
  validate_type_string(Idevid, ValidIdevid, "Idevid"),
  % Validate and assert Name
  validate_type_string(Name, ValidName, "Name"),
  assert_device(ValidCreatedAt, ValidId, ValidIdevid, ValidName).

remove_device(CreatedAt, Id, Idevid, Name) :-
  device(CreatedAt, Id, Idevid, Name),
  with_mutex(db, (
    retractall_device(CreatedAt, Id, Idevid, Name)
  )).

:- persistent
  db:manufactured(_CreatedAt, _DeviceId, _ManufacturerId).

get_manufactured(CreatedAt, DeviceId, ManufacturerId) :-
  with_mutex(db, manufactured(CreatedAt, DeviceId, ManufacturerId)).

get_all_manufactured(CreatedAt, DeviceId, ManufacturerId, Matches) :- 
 with_mutex(db, 
    findall(manufactured(CreatedAt, DeviceId, ManufacturerId),
            manufactured(CreatedAt, DeviceId, ManufacturerId),
            Matches)
).

add_manufactured(CreatedAt, DeviceId, ManufacturerId) :-
  % Validate required fields
  validate_required(DeviceId, "DeviceId"),
  validate_required(ManufacturerId, "ManufacturerId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert DeviceId
  validate_type_string(DeviceId, ValidDeviceId, "DeviceId"),
  % Validate and assert ManufacturerId
  validate_type_string(ManufacturerId, ValidManufacturerId, "ManufacturerId"),
  assert_manufactured(ValidCreatedAt, ValidDeviceId, ValidManufacturerId).

remove_manufactured(CreatedAt, DeviceId, ManufacturerId) :-
  manufactured(CreatedAt, DeviceId, ManufacturerId),
  with_mutex(db, (
    retractall_manufactured(CreatedAt, DeviceId, ManufacturerId)
  )).

:- persistent
  db:manufacturer_trust(_CreatedAt, _ManufacturerId, _UserId).

get_manufacturer_trust(CreatedAt, ManufacturerId, UserId) :-
  with_mutex(db, manufacturer_trust(CreatedAt, ManufacturerId, UserId)).

get_all_manufacturer_trust(CreatedAt, ManufacturerId, UserId, Matches) :- 
 with_mutex(db, 
    findall(manufacturer_trust(CreatedAt, ManufacturerId, UserId),
            manufacturer_trust(CreatedAt, ManufacturerId, UserId),
            Matches)
).

add_manufacturer_trust(CreatedAt, ManufacturerId, UserId) :-
  % Validate required fields
  validate_required(UserId, "UserId"),
  validate_required(ManufacturerId, "ManufacturerId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert ManufacturerId
  validate_type_string(ManufacturerId, ValidManufacturerId, "ManufacturerId"),
  % Validate and assert UserId
  validate_type_string(UserId, ValidUserId, "UserId"),
  assert_manufacturer_trust(ValidCreatedAt, ValidManufacturerId, ValidUserId).

remove_manufacturer_trust(CreatedAt, ManufacturerId, UserId) :-
  manufacturer_trust(CreatedAt, ManufacturerId, UserId),
  with_mutex(db, (
    retractall_manufacturer_trust(CreatedAt, ManufacturerId, UserId)
  )).

:- persistent
  db:sbom(_CreatedAt, _Id, _Sbom).

get_sbom(CreatedAt, Id, Sbom) :-
  with_mutex(db, sbom(CreatedAt, Id, Sbom)).

get_all_sbom(CreatedAt, Id, Sbom, Matches) :- 
 with_mutex(db, 
    findall(sbom(CreatedAt, Id, Sbom),
            sbom(CreatedAt, Id, Sbom),
            Matches)
).

add_sbom(CreatedAt, Id, Sbom) :-
  % Validate required fields
  validate_required(Id, "Id"),
  validate_required(Sbom, "Sbom"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  (sbom(_,Id,_) ->
    format(atom(Msg), 'found existing sbom with Id "~w"', [Id]),
    !,
    throw(error(Msg))
  ; true),
  (sbom(_,_,Sbom) ->
    format(atom(Msg), 'found existing sbom with Sbom "~w"', [Sbom]),
    !,
    throw(error(Msg))
  ; true),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert Id
  validate_type_string(Id, ValidId, "Id"),
  % Validate and assert Sbom
  validate_type_string(Sbom, ValidSbom, "Sbom"),
  assert_sbom(ValidCreatedAt, ValidId, ValidSbom).

remove_sbom(CreatedAt, Id, Sbom) :-
  sbom(CreatedAt, Id, Sbom),
  with_mutex(db, (
    retractall_sbom(CreatedAt, Id, Sbom)
  )).

:- persistent
  db:manufacturer(_CreatedAt, _Id, _Name).

get_manufacturer(CreatedAt, Id, Name) :-
  with_mutex(db, manufacturer(CreatedAt, Id, Name)).

get_all_manufacturer(CreatedAt, Id, Name, Matches) :- 
 with_mutex(db, 
    findall(manufacturer(CreatedAt, Id, Name),
            manufacturer(CreatedAt, Id, Name),
            Matches)
).

add_manufacturer(CreatedAt, Id, Name) :-
  % Validate required fields
  validate_required(Id, "Id"),
  validate_required(Name, "Name"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  (manufacturer(_,Id,_) ->
    format(atom(Msg), 'found existing manufacturer with Id "~w"', [Id]),
    !,
    throw(error(Msg))
  ; true),
  (manufacturer(_,_,Name) ->
    format(atom(Msg), 'found existing manufacturer with Name "~w"', [Name]),
    !,
    throw(error(Msg))
  ; true),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert Id
  validate_type_string(Id, ValidId, "Id"),
  % Validate and assert Name
  validate_type_string(Name, ValidName, "Name"),
  assert_manufacturer(ValidCreatedAt, ValidId, ValidName).

remove_manufacturer(CreatedAt, Id, Name) :-
  manufacturer(CreatedAt, Id, Name),
  with_mutex(db, (
    retractall_manufacturer(CreatedAt, Id, Name)
  )).

:- persistent
  db:has_vulnerability(_CreatedAt, _SbomId, _VulnerabilityId).

get_has_vulnerability(CreatedAt, SbomId, VulnerabilityId) :-
  with_mutex(db, has_vulnerability(CreatedAt, SbomId, VulnerabilityId)).

get_all_has_vulnerability(CreatedAt, SbomId, VulnerabilityId, Matches) :- 
 with_mutex(db, 
    findall(has_vulnerability(CreatedAt, SbomId, VulnerabilityId),
            has_vulnerability(CreatedAt, SbomId, VulnerabilityId),
            Matches)
).

add_has_vulnerability(CreatedAt, SbomId, VulnerabilityId) :-
  % Validate required fields
  validate_required(VulnerabilityId, "VulnerabilityId"),
  validate_required(SbomId, "SbomId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert SbomId
  validate_type_string(SbomId, ValidSbomId, "SbomId"),
  % Validate and assert VulnerabilityId
  validate_type_string(VulnerabilityId, ValidVulnerabilityId, "VulnerabilityId"),
  assert_has_vulnerability(ValidCreatedAt, ValidSbomId, ValidVulnerabilityId).

remove_has_vulnerability(CreatedAt, SbomId, VulnerabilityId) :-
  has_vulnerability(CreatedAt, SbomId, VulnerabilityId),
  with_mutex(db, (
    retractall_has_vulnerability(CreatedAt, SbomId, VulnerabilityId)
  )).

:- persistent
  db:device_trust(_AuthoriserId, _CreatedAt, _DeviceId).

get_device_trust(AuthoriserId, CreatedAt, DeviceId) :-
  with_mutex(db, device_trust(AuthoriserId, CreatedAt, DeviceId)).

get_all_device_trust(AuthoriserId, CreatedAt, DeviceId, Matches) :- 
 with_mutex(db, 
    findall(device_trust(AuthoriserId, CreatedAt, DeviceId),
            device_trust(AuthoriserId, CreatedAt, DeviceId),
            Matches)
).

add_device_trust(AuthoriserId, CreatedAt, DeviceId) :-
  % Validate required fields
  validate_required(DeviceId, "DeviceId"),
  validate_required(AuthoriserId, "AuthoriserId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert AuthoriserId
  validate_type_string(AuthoriserId, ValidAuthoriserId, "AuthoriserId"),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert DeviceId
  validate_type_string(DeviceId, ValidDeviceId, "DeviceId"),
  assert_device_trust(ValidAuthoriserId, ValidCreatedAt, ValidDeviceId).

remove_device_trust(AuthoriserId, CreatedAt, DeviceId) :-
  device_trust(AuthoriserId, CreatedAt, DeviceId),
  with_mutex(db, (
    retractall_device_trust(AuthoriserId, CreatedAt, DeviceId)
  )).

:- persistent
  db:has_sbom(_CreatedAt, _DeviceTypeId, _SbomId).

get_has_sbom(CreatedAt, DeviceTypeId, SbomId) :-
  with_mutex(db, has_sbom(CreatedAt, DeviceTypeId, SbomId)).

get_all_has_sbom(CreatedAt, DeviceTypeId, SbomId, Matches) :- 
 with_mutex(db, 
    findall(has_sbom(CreatedAt, DeviceTypeId, SbomId),
            has_sbom(CreatedAt, DeviceTypeId, SbomId),
            Matches)
).

add_has_sbom(CreatedAt, DeviceTypeId, SbomId) :-
  % Validate required fields
  validate_required(SbomId, "SbomId"),
  validate_required(DeviceTypeId, "DeviceTypeId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert DeviceTypeId
  validate_type_string(DeviceTypeId, ValidDeviceTypeId, "DeviceTypeId"),
  % Validate and assert SbomId
  validate_type_string(SbomId, ValidSbomId, "SbomId"),
  assert_has_sbom(ValidCreatedAt, ValidDeviceTypeId, ValidSbomId).

remove_has_sbom(CreatedAt, DeviceTypeId, SbomId) :-
  has_sbom(CreatedAt, DeviceTypeId, SbomId),
  with_mutex(db, (
    retractall_has_sbom(CreatedAt, DeviceTypeId, SbomId)
  )).

:- persistent
  db:device_type(_CreatedAt, _Id, _Name).

get_device_type(CreatedAt, Id, Name) :-
  with_mutex(db, device_type(CreatedAt, Id, Name)).

get_all_device_type(CreatedAt, Id, Name, Matches) :- 
 with_mutex(db, 
    findall(device_type(CreatedAt, Id, Name),
            device_type(CreatedAt, Id, Name),
            Matches)
).

add_device_type(CreatedAt, Id, Name) :-
  % Validate required fields
  validate_required(Id, "Id"),
  validate_required(Name, "Name"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  (device_type(_,Id,_) ->
    format(atom(Msg), 'found existing device_type with Id "~w"', [Id]),
    !,
    throw(error(Msg))
  ; true),
  (device_type(_,_,Name) ->
    format(atom(Msg), 'found existing device_type with Name "~w"', [Name]),
    !,
    throw(error(Msg))
  ; true),
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert Id
  validate_type_string(Id, ValidId, "Id"),
  % Validate and assert Name
  validate_type_string(Name, ValidName, "Name"),
  assert_device_type(ValidCreatedAt, ValidId, ValidName).

remove_device_type(CreatedAt, Id, Name) :-
  device_type(CreatedAt, Id, Name),
  with_mutex(db, (
    retractall_device_type(CreatedAt, Id, Name)
  )).

:- persistent
  db:is_of_device_type(_CreatedAt, _DeviceId, _DeviceTypeId).

get_is_of_device_type(CreatedAt, DeviceId, DeviceTypeId) :-
  with_mutex(db, is_of_device_type(CreatedAt, DeviceId, DeviceTypeId)).

get_all_is_of_device_type(CreatedAt, DeviceId, DeviceTypeId, Matches) :- 
 with_mutex(db, 
    findall(is_of_device_type(CreatedAt, DeviceId, DeviceTypeId),
            is_of_device_type(CreatedAt, DeviceId, DeviceTypeId),
            Matches)
).

add_is_of_device_type(CreatedAt, DeviceId, DeviceTypeId) :-
  % Validate required fields
  validate_required(DeviceId, "DeviceId"),
  validate_required(DeviceTypeId, "DeviceTypeId"),
  validate_required(CreatedAt, "CreatedAt"),
  % Check unique fields are unique
  % Validate and assert CreatedAt
  validate_type_integer(CreatedAt, ValidCreatedAt, "CreatedAt"),
  % Validate and assert DeviceId
  validate_type_string(DeviceId, ValidDeviceId, "DeviceId"),
  % Validate and assert DeviceTypeId
  validate_type_string(DeviceTypeId, ValidDeviceTypeId, "DeviceTypeId"),
  assert_is_of_device_type(ValidCreatedAt, ValidDeviceId, ValidDeviceTypeId).

remove_is_of_device_type(CreatedAt, DeviceId, DeviceTypeId) :-
  is_of_device_type(CreatedAt, DeviceId, DeviceTypeId),
  with_mutex(db, (
    retractall_is_of_device_type(CreatedAt, DeviceId, DeviceTypeId)
  )).

% rules from rule claims

  device_connection_rights(DeviceName, OwnerCanIssueConnectionRights, AuthoriserCanIssueConnectionRights) :- 
 device(Id, DeviceName, _IDevID, _DeviceCreatedOn),
 owns(OwnerId, Id),
 user(OwnerId, _OwnerName, _, _, _, OwnerCanIssueConnectionRights, _),
 allow_to_connect(Id, AuthoriserId),
 user(AuthoriserId, _AuthoriserName, _, _, _, AuthoriserCanIssueConnectionRights, _).


device_trusted(DeviceName) :-
 (device_connection_rights(DeviceName, true, false) ; device_connection_rights(DeviceName, false, true)).


device_manufacturer(DeviceName, ManufacturerId, ManufacturerName, ManufacturerCreatedOn) :-  
  device(Id, DeviceName, _IDevID, _DeviceCreatedOn), 
 manufactured(Id, ManufacturerId, _ManufacturedEntryCreatedOn), 
  manufacturer(ManufacturerId, ManufacturerName, ManufacturerCreatedOn).


device_manufacturer_trusted(DeviceName) :-  
 device_manufacturer(DeviceName, ManufacturerId, _ManufacturerName, _ManufacturerCreatedOn),  
 trust(TrusterId, ManufacturerId, _TrustCreatedOn),  
 user(TrusterId, _Username, _Role, _UserCreatedOn, _CanIssuePurchaseRights, _CanIssueConnectionRights, true).

