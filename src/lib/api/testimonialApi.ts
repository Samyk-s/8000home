import { TestimonialPayload } from "@/types/testimonials";
import { api } from "../axios-config/api";
import { Params } from "@/types/utils-type";

class TestmonialApi {
  // create testimonial
  async createTestimonial(data: TestimonialPayload) {
    try {
      const res = await api.post("/testimonials", data)
      return res.data
    } catch (error) {
      throw error;
    }
  }
  // get testimonials
  async getTestimonial(params: Params) {
    try {
      const res = await api.get(`/testimonials?page=${params?.page}&limit=${params?.limit}`)
      return res.data
    } catch (error) {
      throw error;
    }
  }
  // toggle testimonials
  async toggleTestimonial(id: number) {
    try {
      const res = await api.patch(`/testimonials/${id}/toggle-status`)
      return res.data
    } catch (error) {
      throw error;
    }
  }
  // toggle testimonials
  async deleteTestimonial(id: number) {
    try {
      const res = await api.delete(`/testimonials/${id}`)
      return res.data
    } catch (error) {
      throw error;
    }
  }
  // toggle testimonials
  async getTestimonialById(id: number) {
    try {
      const res = await api.get(`/testimonials/by-id/${id}`)
      return res.data
    } catch (error) {
      throw error;
    }
  }

  // create testimonial
  async updateTesimonial(id: number, data: TestimonialPayload) {
    try {
      const res = await api.patch(`/testimonials/${id}`, data)
      return res.data
    } catch (error) {
      throw error;
    }
  }
  // search testimonial
  async searchTesimonial(params: Params) {
    try {
      const res = await api.get(`/testimonials/search?keyword=${params?.search}&page=${params?.page}&limit=${params?.limit}`)
      return res.data
    } catch (error) {
      throw error;
    }
  }
}

const testimonialApi = new TestmonialApi()

export default testimonialApi