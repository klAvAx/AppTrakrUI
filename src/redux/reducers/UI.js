import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  notification: {
    message: "",
    translatable: true,
    bottomOffset: 0,
    args: []
  },
  backdrop: {
    visible: false,
    wantsToClose: false,
    zIndex: 1250
  },
  header: {
    recordButtonDisabled: false
  },
  collapsed: {
  
  },
  expanded: {
  
  }
};

export const deleteGroupData = createAsyncThunk("ui/deleteGroupData", async (groupID, thunkAPI) => {
  try {
    return await window.ipc.invokeGeneralInvoke({action: "deleteGroupData", payload: groupID});
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const UISlice = createSlice({
  name: 'UI',
  initialState,
  reducers: {
    setNotification: (state, data) => {
      if(typeof data.payload === "string") {
        state.notification.message = data.payload;
      } else {
        if(!Object.keys(data.payload).includes("translatable")) {
          data.payload['translatable'] = true;
        }
        if(!Object.keys(data.payload).includes("bottomOffset")) {
          data.payload['bottomOffset'] = 0;
        }
        if(!Object.keys(data.payload).includes("args") || !data.payload['translatable']) {
          data.payload['args'] = [];
        }
        
        state.notification = data.payload;
      }
    },
    resetNotification: (state) => {
      state.notification = {
        message: "",
        translatable: true,
        bottomOffset: 0,
        args: []
      };
    },
    
    toggleBackdrop: (state, data) => {
      state.backdrop.wantsToClose = false;
      
      if(data.payload !== undefined) {
        state.backdrop.visible = data.payload;
        if(!state.backdrop.visible) state.backdrop.zIndex = 1250;
        return
      }
      
      state.backdrop.visible = !state.backdrop.visible;
      if(!state.backdrop.visible) state.backdrop.zIndex = 1250;
    },
    shouldCloseBackdrop: (state) => {
      state.backdrop.wantsToClose = true;
      state.backdrop.zIndex = 1250;
    },
    setBackdropIndex: (state, data) => {
      if(data.payload === undefined) return;
      
      state.backdrop.zIndex = data.payload;
    },
    
    disableRecordButton: (state) => {
      state.header.recordButtonDisabled = true;
    },
    enableRecordButton: (state) => {
      state.header.recordButtonDisabled = false;
    },
    
    toggleCollapsed: (state, data) => {
      if(data.payload?.group !== undefined && data.payload?.key !== undefined) {
        const { group, key } = data.payload;
        
        if (state.collapsed[group] === undefined) state.collapsed[group] = {};
        
        state.collapsed[group][key] = (state.collapsed[group][key] === undefined ? true : !state.collapsed[group][key]);
      }
    },
    toggleExpanded: (state, data) => {
      console.log("toggleExpanded", state, data);
    }
  },
  extraReducers: (builder) => {
    // Delete Group Offset
    builder.addCase(deleteGroupData.fulfilled, (state, response) => {
      //console.log(state, response);
    });
    builder.addCase(deleteGroupData.rejected, (state, response) => {
      console.error("TODO", "deleteGroupData", response);
    });
  }
});

export const {
  setNotification, resetNotification,
  toggleBackdrop, shouldCloseBackdrop, setBackdropIndex,
  disableRecordButton, enableRecordButton,
  toggleCollapsed, toggleExpanded
} = UISlice.actions;
export default UISlice.reducer;