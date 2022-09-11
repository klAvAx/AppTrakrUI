import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { requestNewStatisticsList } from "./processList";

const initialState = {
  settings: {},
  filters: {}
};

// Get All Generic App Settings
export const getAppSettings = createAsyncThunk("electron/getAppSettings", async (_, thunkAPI) => {
  try {
    return await window.ipc.invokeGeneralInvoke({action: "getAppSettings"});
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

// For Use With Boolean Stuff (Essentially toggle)
export const toggleAppSetting = createAsyncThunk("electron/toggleAppSetting", async (setting, thunkAPI) => {
  try {
    return await window.ipc.invokeGeneralInvoke({action: "toggleAppSetting", payload: setting});
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

// For Getting Single Value
export const getAppSetting = createAsyncThunk("electron/getAppSetting", async (setting, thunkAPI) => {
  try {
    return await window.ipc.invokeGeneralInvoke({action: "getAppSetting", payload: setting});
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

// For Use With Settable Settings (Int, String, Etc.)
// Expected Object {setting: string, value: any}
export const setAppSetting = createAsyncThunk("electron/setAppSetting", async (settingObj, thunkAPI) => {
  try {
    return await window.ipc.invokeGeneralInvoke({action: "setAppSetting", payload: {setting: settingObj['setting'], value: settingObj['value']}});
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const updateAppFilters = createAsyncThunk("electron/updateAppFilters", async (data, thunkAPI) => {
  try {
    const result = await window.ipc.invokeGeneralInvoke({action: "updateAppFilters", payload: data});
    
    if(result.response.status === 1 && (result.response.code === "set" || result.response.code === "deleted" || result.response.code === "cleared")) {
      thunkAPI.dispatch(requestNewStatisticsList());
    }
    
    return result;
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

// Redux Slice
export const electronSlice = createSlice({
  name: 'electron',
  initialState,
  reducers: {
    setTempAppSetting: (state, data) => {
      state.settings[data.payload.setting] = data.payload.value;
    }
  },
  extraReducers: (builder) => {
    // Get App Settings
    builder.addCase(getAppSettings.fulfilled, (state, response) => {
      for(const dataKey in response.payload.response) {
        state[dataKey] = response?.payload?.response[dataKey];
      }
    });
    builder.addCase(getAppSettings.rejected, (state, response) => {
      state.settings = null;
      state.filters = null;
    });
    
    // Toggle App Setting
    builder.addCase(toggleAppSetting.fulfilled, (state, response) => {
      state.settings[response?.payload?.setting] = response?.payload?.value;
    });
    builder.addCase(toggleAppSetting.rejected, (state, response) => {
      console.error("TODO", "toggleAppSetting", response)
    });
  
    // Get App Setting
    builder.addCase(getAppSetting.fulfilled, (state, response) => {
      console.log("TODO", "getAppSetting", response);
    });
    builder.addCase(getAppSetting.rejected, (state, response) => {
      console.error("TODO", "getAppSetting", response)
    });
  
    // Set App Setting
    builder.addCase(setAppSetting.fulfilled, (state, response) => {
      state.settings[response?.payload?.setting] = response?.payload?.value;
    });
    builder.addCase(setAppSetting.rejected, (state, response) => {
      console.error("TODO", "setAppSetting", "rejected", response);
    });
    
    builder.addCase(updateAppFilters.fulfilled, (state, response) => {
      if(response.payload.response.status === 0) return;
      
      const groupID = response.payload.request.payload.groupID;
      const filterType = response.payload.request.payload.filterType;
      
      switch (response.payload.response.code) {
        case "set": {
          const filterData = response.payload.request.payload.filterData;
          
          if(state.filters?.[groupID] === undefined) state.filters[groupID] = {};
          state.filters[groupID][filterType] = filterData;
          break;
        }
        case "deleted": {
          if(state.filters?.[groupID]?.[filterType]) delete state.filters[groupID][filterType];
          if(Object.keys(state?.filters?.[groupID]).length === 0) delete state.filters[groupID];
          break;
        }
        case "cleared": {
          if(state.filters?.[groupID]) delete state.filters[groupID];
          break;
        }
      }
    });
    builder.addCase(updateAppFilters.rejected, (state, response) => {
      console.error("TODO", "updateAppFilters", "rejected", response);
    });
  }
});

export const { setTempAppSetting } = electronSlice.actions;
export default electronSlice.reducer;