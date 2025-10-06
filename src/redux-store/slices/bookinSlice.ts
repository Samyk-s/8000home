import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Meta, Params } from "@/types/utils-type";
import { message } from "antd";
import { BookingItem, BookingPayload } from "@/types/booking";
import bookingApi from "@/lib/api/bookingApi";

// ================= Async Thunks =================

// Fetch departures
export const fetchBooking = createAsyncThunk<
  { items: BookingItem[]; meta: Meta },
  { params: Params },
  { rejectValue: string }
>("bookings/fetchbookings", async ({ params }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.getBookings(params);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});
export const fetchBookingById = createAsyncThunk<
  { items: BookingItem; meta: Meta },
  number,
  { rejectValue: string }
>("bookings/fetchbookingsbyid", async (id, { rejectWithValue }) => {
  try {
    const res = await bookingApi.getBooking(id);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});
export const viewBookingById = createAsyncThunk<
  { items: BookingItem; meta: Meta },
  { id: number, isViewed: number },
  { rejectValue: string }
>("bookings/fetchbookingview", async ({ id, isViewed }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.viwBooking(id, isViewed);
    // console.log(res, "sdfds")
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});



// Create departure payload
// interface CreateDeparturePayload {
//   id: number;
//   data: Partial<DepartureItem>;
// }

// Toggle/Delete payload
// interface DeparturePayload {
//   packageId: number;
//   departureId: number;
// }

// Create departure
// export const createDeparture = createAsyncThunk<
//   DepartureItem,
//   CreateDeparturePayload,
//   { rejectValue: string }
// >("departures/createDeparture", async ({ id, data }, { rejectWithValue }) => {
//   try {
//     const res = await departureApi.createDeparture(id, data as DepartureItem);
//     // console.log(res, "create")
//     return res.data;
//   } catch (err: any) {
//     return rejectWithValue(err?.message || "Failed to create departure");
//   }
// });

// update booking 
export const updateBooking = createAsyncThunk<
  BookingItem,
  { id: number, data: BookingPayload },
  { rejectValue: string }
>("bookings/updateBooking", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.updateBooking(id, data);
    message.success(res?.message)
    return res.data as BookingItem;
  } catch (err: any) {
    message.error("Failed to update")
    return rejectWithValue(err?.message || "Failed to update");
  }
});
// update booking 
export const assignBooking = createAsyncThunk<
  BookingItem,
  { bookingId: number, teamId: number },
  { rejectValue: string }
>("bookings/assignBooking", async ({ bookingId, teamId }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.assignBooking(bookingId, teamId);
    message.success(res?.message)
    return res.data as BookingItem;
  } catch (err: any) {
    message.error("Failed to update")
    return rejectWithValue(err?.message || "Failed to update");
  }
});
// Delete booking
export const deleteBooking = createAsyncThunk<
  { id: number },
  number,
  { rejectValue: string }
>(
  "bookings/deleteBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await bookingApi.deleteBooking(id);
      message.success(res?.message);
      return { id };
    } catch (err: any) {
      message.error("Failed to delete");
      return rejectWithValue(err?.message || "Failed to delete booking");
    }
  }
);


//search
export const searchBooking = createAsyncThunk<
  { items: BookingItem[]; meta: Meta },
  { params: Params }
>("bookings/searchBookins", async ({ params }, { rejectWithValue }) => {
  try {
    const res = await bookingApi.searchBookings(params);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});
// ================= State =================
interface BookinState {
  items: BookingItem[];
  meta: Meta;
  error: string | null;
  loading: boolean;
  booking: BookingItem | null
}

const initialState: BookinState = {
  items: [],
  meta: {
    currentPage: 1,
    itemCount: 0,
    totalItems: 0,
    totalPages: 0,
    itemsPerPage: 0,
  },
  error: null,
  loading: false,
  booking: null
};

// ================= Slice =================
const bookingsSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action: PayloadAction<{ items: BookingItem[]; meta: Meta }>) => {
        state.items = action.payload?.items
        state.meta = action.payload?.meta;
        state.loading = false;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to fetch departures";
        state.loading = false;
      });
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<any>) => {
        state.booking = action.payload
        state.loading = false

      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to fetch booking";

      });
    // view
    builder
      .addCase(viewBookingById.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(viewBookingById.fulfilled, (state, action: PayloadAction<any>) => {
        const index = state.items?.findIndex(item => item.id === action.payload?.id);
        if (index !== -1 && state.items[index]) {
          state.items[index].isViewd = action.payload?.isViewd ?? state.items[index].isViewd;
        }
        state.loading = false;
      })
      .addCase(viewBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch booking";
      });


    // Create
    // builder
    //   .addCase(createDeparture.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(createDeparture.fulfilled, (state, action: PayloadAction<DepartureItem>) => {
    //     if (!Array.isArray(state.items)) state.items = [];
    //     state.items.push(action.payload);
    //     state.meta.itemCount += 1;
    //     state.meta.totalItems += 1;
    //     state.loading = false;
    //   })
    //   .addCase(createDeparture.rejected, (state, action) => {
    //     state.error = action.payload as string || "Failed to create departure";
    //     state.loading = false;
    //   });

    // update
    builder
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {

        const index = state.items.findIndex((item) => item?.id === action.payload?.id);
        if (index !== -1) state.items[index] = action?.payload;

        state.loading = false;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to update";
        state.loading = false;
      });
    //assign
    builder
      .addCase(assignBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignBooking.fulfilled, (state, action: PayloadAction<BookingItem>) => {

        const index = state.items.findIndex((item) => item?.id === action.payload?.id);
        if (index !== -1) state.items[index] = action?.payload;

        state.loading = false;
      })
      .addCase(assignBooking.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to update";
        state.loading = false;
      });

    // Delete
    builder
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        if (Array.isArray(state.items)) {
          state.items = state.items.filter((item) => item.id !== action.payload.id);
        }
        state.meta.itemCount = Math.max(0, state.meta.itemCount - 1);
        state.meta.totalItems = Math.max(0, state.meta.totalItems - 1);
        state.loading = false;
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.error = action.payload as string || "Failed to delete booking";
        state.loading = false;
      });
    //search
    builder.addCase(searchBooking.pending, (state) => {
      state.loading = true;
    })
      .addCase(searchBooking.fulfilled, (state, action: PayloadAction<any>) => {
        state.items = action.payload.items;
        state.meta = action.payload.meta
        state.loading = false;
      })
      .addCase(searchBooking.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
        state.loading = false;
      })
  },
});

export default bookingsSlice.reducer;
